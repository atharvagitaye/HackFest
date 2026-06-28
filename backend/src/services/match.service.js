const donationRepo = require('../repositories/donation.repository');
const matchRepo = require('../repositories/match.repository');
const deliveryRepo = require('../repositories/delivery.repository');
const mlClient = require('../ml/mlClient');
const AppError = require('../utils/AppError');
const config = require('../config/env');
const prisma = require('../config/prisma');
const notifService = require('./notification.service');

/**
 * Calculate historical success rate for a recipient.
 * Success = delivery completed without major delays or issues.
 * @param {string} recipientId 
 * @returns {Promise<{successRate: number, totalDeliveries: number}>}
 */
const calculateHistoricalSuccess = async (recipientId) => {
  // Get all completed deliveries for this recipient
  const deliveries = await prisma.delivery.findMany({
    where: { 
      recipientId,
      completed: true,
    },
    select: {
      id: true,
      delayMinutes: true,
      completed: true,
      deliveryTime: true,
      pickupTime: true,
    },
  });

  const totalDeliveries = deliveries.length;
  
  if (totalDeliveries === 0) {
    return { successRate: 0.5, totalDeliveries: 0 }; // Neutral for new users
  }

  // Define success criteria:
  // - Delivery completed
  // - Delay less than 60 minutes (generous threshold)
  const successfulDeliveries = deliveries.filter(d => {
    const delay = d.delayMinutes || 0;
    return d.completed && delay < 60;
  }).length;

  const successRate = successfulDeliveries / totalDeliveries;
  
  return { 
    successRate: parseFloat(successRate.toFixed(4)), 
    totalDeliveries 
  };
};

/**
 * Extract feature vectors from candidates relative to a donation.
 * Enhanced with historical performance data.
 */
const extractFeatures = async (donation, candidates) => {
  const now = new Date();
  const expiryMs = donation.expiryTime ? new Date(donation.expiryTime) - now : null;
  const maxMs = 24 * 60 * 60 * 1000; // 24 hours as baseline

  // Calculate historical success rates for all candidates in parallel
  const historicalData = await Promise.all(
    candidates.map(c => calculateHistoricalSuccess(c.recipientId))
  );

  return candidates.map((c, index) => {
    // Urgency: closer to expiry = higher score (clamped 0–1)
    const urgencyScore = expiryMs !== null
      ? parseFloat(Math.max(0, 1 - expiryMs / maxMs).toFixed(4))
      : 0.5;

    // Capacity fit: how well the recipient capacity matches the donation quantity
    const capacityFitScore = c.maxCapacityKg && donation.quantityKg
      ? parseFloat(Math.min(1, donation.quantityKg / c.maxCapacityKg).toFixed(4))
      : 0.5;

    const historical = historicalData[index];

    return {
      recipientId: c.recipientId,
      distanceKm: c.distance_km,
      urgencyScore,
      capacityFitScore,
      trustScore: c.trustScore ?? 0.5,
      maxCapacityKg: c.maxCapacityKg,
      donationKg: donation.quantityKg,
      historicalSuccessRate: historical.successRate,
      totalDeliveries: historical.totalDeliveries,
    };
  });
};

/**
 * Score candidates using ML client (rule-based now, swappable later).
 */
const scoreCandidates = (features) => mlClient.predictMatches(features);

/**
 * Persist match results to DB.
 */
const saveMatches = async (donationId, predictions) => {
  // Delete stale matches first so recalculation replaces rather than appends
  await prisma.match.deleteMany({ where: { donationId } });

  const records = predictions.map((p) => ({
    donationId,
    recipientId: p.recipientId,
    predictedSuccessProbability: p.predictedSuccessProbability,
    distanceKm: p.distanceKm,
    urgencyScore: p.urgencyScore,
    capacityFitScore: p.capacityFitScore,
    trustScoreUsed: p.trustScore,
    modelVersion: p.modelVersion,
  }));

  await matchRepo.createMany(records);
};

/**
 * Main orchestrator — AI-ready modular design with enhanced algorithmic matching.
 */
const generateMatches = async (donationId) => {
  const donation = await donationRepo.findById(donationId);
  if (!donation) throw AppError.notFound('Donation not found');
  if (!donation.latitude || !donation.longitude) {
    throw AppError.badRequest('Donation must have latitude/longitude for matching');
  }

  const candidates = await donationRepo.findNearbyRecipients(donation, config.matching.radiusKm);
  if (!candidates.length) {
    return { matched: 0, message: 'No nearby recipients found' };
  }

  // Extract features with historical data (now async)
  const features = await extractFeatures(donation, candidates);
  const predictions = await scoreCandidates(features);

  await saveMatches(donationId, predictions);

  // Notify each matched recipient
  const matchResults = await matchRepo.findByDonation(donationId);
  const food = donation.foodCategory ?? 'a donation';
  for (const m of matchResults) {
    notifService.push(
      m.recipientId,
      'DONATION_MATCHED',
      'New Donation Matched',
      `A donation of ${donation.quantityKg ?? '?'} kg ${food} has been matched to your organisation.`,
      { href: '/my-matches', meta: { donationId } }
    );
  }

  return matchResults;
};

const getMatchesForDonation = (donationId) => matchRepo.findByDonation(donationId);

const getMyMatches = (recipientId) => matchRepo.findByRecipient(recipientId);

/**
 * Recipient accepts a match → marks match selected + advances donation to ACCEPTED.
 */
const acceptMatch = async (matchId, recipientId) => {
  const match = await matchRepo.findById(matchId);
  if (!match) throw AppError.notFound('Match not found');
  if (match.recipientId !== recipientId) throw AppError.forbidden('Not your match');
  if (match.donation.status !== 'MATCHED') {
    throw AppError.badRequest('Donation is not in MATCHED state');
  }

  await matchRepo.markSelected(matchId);
  await donationRepo.updateStatus(match.donationId, 'ACCEPTED');
  await donationRepo.createStatusLog({
    donationId: match.donationId,
    oldStatus: 'MATCHED',
    newStatus: 'ACCEPTED',
    changedBy: recipientId,
  });

  // Create delivery record with QR token when match is accepted
  await deliveryRepo.create({
    donationId: match.donationId,
    recipientId: recipientId,
    status: 'PENDING_PICKUP',
  });

  // Notify donor that their donation was accepted
  notifService.push(
    match.donation.donorId,
    'DONATION_ACCEPTED',
    'Match Accepted',
    `Your donation of ${match.donation.foodCategory ?? 'food'} has been accepted and is ready for pickup.`,
    { href: '/my-donations', meta: { donationId: match.donationId } }
  );

  return matchRepo.findById(matchId);
};

/**
 * Recipient rejects a match — donation stays MATCHED, match de-selected.
 */
const rejectMatch = async (matchId, recipientId) => {
  const match = await matchRepo.findById(matchId);
  if (!match) throw AppError.notFound('Match not found');
  if (match.recipientId !== recipientId) throw AppError.forbidden('Not your match');

  const updated = await require('../config/prisma').match.update({
    where: { id: matchId },
    data: { selected: false },
    include: { recipient: { select: { id: true, name: true, email: true, trustScore: true } } },
  });
  return updated;
};

module.exports = { generateMatches, getMatchesForDonation, acceptMatch, rejectMatch, getMyMatches };
