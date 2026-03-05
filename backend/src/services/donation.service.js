const donationRepo = require('../repositories/donation.repository');
const matchRepo = require('../repositories/match.repository');
const AppError = require('../utils/AppError');
const config = require('../config/env');

const VALID_TRANSITIONS = {
  REPORTED: ['MATCHED', 'CANCELLED'],
  MATCHED: ['ACCEPTED', 'CANCELLED'],
  ACCEPTED: ['PICKED_UP', 'CANCELLED'],
  PICKED_UP: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
  EXPIRED: [],
};

const createDonation = async (donorId, body) => {
  const donation = await donationRepo.create({ donorId, ...body });

  // Auto-run AI matching if coordinates are provided
  if (donation.latitude && donation.longitude) {
    try {
      const radius = config.matching.radiusKm;
      const candidates = await donationRepo.findNearbyRecipients(donation, radius);
      if (candidates.length > 0) {
        const now = new Date();
        const expiryMs = donation.expiryTime ? new Date(donation.expiryTime) - now : null;
        const maxMs = 24 * 60 * 60 * 1000;
        const records = candidates.map((c) => ({
          donationId: donation.id,
          recipientId: c.recipientId,
          distanceKm: c.distance_km,
          urgencyScore: expiryMs !== null ? parseFloat(Math.max(0, 1 - expiryMs / maxMs).toFixed(4)) : 0.5,
          capacityFitScore: c.maxCapacityKg && donation.quantityKg ? parseFloat(Math.min(1, donation.quantityKg / c.maxCapacityKg).toFixed(4)) : 0.5,
          trustScoreUsed: c.trustScore ?? 0.5,
          predictedSuccessProbability: 0.7,
          modelVersion: 'v1.2',
        }));
        await matchRepo.createMany(records);
        await donationRepo.updateStatus(donation.id, 'MATCHED');
        await donationRepo.createStatusLog({ donationId: donation.id, oldStatus: 'REPORTED', newStatus: 'MATCHED', changedBy: donorId });
        return donationRepo.findById(donation.id);
      }
    } catch (_) {
      // Matching failure is non-fatal — donation still created as REPORTED
    }
  }

  return donation;
};

const listDonations = async (query) => {
  const filters = {};
  if (query.status) filters.status = query.status;
  if (query.donorId) filters.donorId = query.donorId;
  return donationRepo.findAll(filters);
};

const getDonation = async (id) => {
  const donation = await donationRepo.findById(id);
  if (!donation) throw AppError.notFound('Donation not found');
  return donation;
};

const updateDonationStatus = async (id, newStatus, changedBy, actorRole) => {
  const donation = await donationRepo.findById(id);
  if (!donation) throw AppError.notFound('Donation not found');

  // Donors can only modify their own donations
  if (actorRole === 'DONOR' && donation.donorId !== changedBy) {
    throw AppError.forbidden('You can only update your own donations');
  }

  const allowed = VALID_TRANSITIONS[donation.status] ?? [];
  if (!allowed.includes(newStatus)) {
    throw AppError.badRequest(
      `Invalid status transition: ${donation.status} → ${newStatus}. Allowed: ${allowed.join(', ') || 'none'}`,
      'INVALID_TRANSITION'
    );
  }

  const updated = await donationRepo.updateStatus(id, newStatus);

  await donationRepo.createStatusLog({
    donationId: id,
    oldStatus: donation.status,
    newStatus,
    changedBy,
  });

  return updated;
};

const getNearbyRecipients = async (donationId) => {
  const donation = await donationRepo.findById(donationId);
  if (!donation) throw AppError.notFound('Donation not found');

  const radius = config.matching.radiusKm;
  return donationRepo.findNearbyRecipients(donation, radius);
};

const addImage = async (donationId, imageUrl) => {
  const donation = await donationRepo.findById(donationId);
  if (!donation) throw AppError.notFound('Donation not found');
  return donationRepo.addImage(donationId, imageUrl);
};

module.exports = { createDonation, listDonations, getDonation, updateDonationStatus, getNearbyRecipients, addImage };
