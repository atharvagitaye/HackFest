const donationRepo = require('../repositories/donation.repository');
const AppError = require('../utils/AppError');
const config = require('../config/env');

const VALID_TRANSITIONS = {
  REPORTED: 'MATCHED',
  MATCHED: 'ACCEPTED',
  ACCEPTED: 'PICKED_UP',
  PICKED_UP: 'DELIVERED',
};

const createDonation = async (donorId, body) => {
  return donationRepo.create({ donorId, ...body });
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

const updateDonationStatus = async (id, newStatus, changedBy) => {
  const donation = await donationRepo.findById(id);
  if (!donation) throw AppError.notFound('Donation not found');

  const expectedNext = VALID_TRANSITIONS[donation.status];
  if (!expectedNext || expectedNext !== newStatus) {
    throw AppError.badRequest(
      `Invalid status transition: ${donation.status} → ${newStatus}. Expected: ${expectedNext || 'no further transitions'}`,
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

module.exports = { createDonation, listDonations, getDonation, updateDonationStatus, getNearbyRecipients };
