const donationRepo = require('../repositories/donation.repository');
const matchRepo = require('../repositories/match.repository');
const mlClient = require('../ml/mlClient');
const AppError = require('../utils/AppError');
const config = require('../config/env');

/**
 * Extract feature vectors from candidates relative to a donation.
 */
const extractFeatures = (donation, candidates) => {
  const now = new Date();
  const expiryMs = donation.expiryTime ? new Date(donation.expiryTime) - now : null;
  const maxMs = 24 * 60 * 60 * 1000; // 24 hours as baseline

  return candidates.map((c) => {
    // Urgency: closer to expiry = higher score (clamped 0–1)
    const urgencyScore = expiryMs !== null
      ? parseFloat(Math.max(0, 1 - expiryMs / maxMs).toFixed(4))
      : 0.5;

    // Capacity fit: how well the recipient capacity matches the donation quantity
    const capacityFitScore = c.maxCapacityKg && donation.quantityKg
      ? parseFloat(Math.min(1, donation.quantityKg / c.maxCapacityKg).toFixed(4))
      : 0.5;

    return {
      recipientId: c.recipientId,
      distanceKm: c.distance_km,
      urgencyScore,
      capacityFitScore,
      trustScore: c.trustScore ?? 0.5,
      maxCapacityKg: c.maxCapacityKg,
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
 * Main orchestrator — AI-ready modular design.
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

  const features = extractFeatures(donation, candidates);
  const predictions = await scoreCandidates(features);

  await saveMatches(donationId, predictions);

  return matchRepo.findByDonation(donationId);
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
