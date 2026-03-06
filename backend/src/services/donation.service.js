const donationRepo = require('../repositories/donation.repository');
const matchService = require('./match.service');
const AppError = require('../utils/AppError');
const config = require('../config/env');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
  // If the donor didn't supply pickup coordinates, inherit from their organization
  let { latitude, longitude } = body;
  if (!latitude || !longitude) {
    const donor = await prisma.user.findUnique({
      where: { id: donorId },
      include: { organization: true },
    });
    if (donor?.organization?.latitude && donor?.organization?.longitude) {
      latitude = donor.organization.latitude;
      longitude = donor.organization.longitude;
    }
  }

  const donation = await donationRepo.create({ donorId, ...body, latitude, longitude });

  // Auto-run AI matching if coordinates are provided
  if (donation.latitude && donation.longitude) {
    try {
      const result = await matchService.generateMatches(donation.id);
      if (Array.isArray(result) && result.length > 0) {
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
  if (query.search) {
    filters.OR = [
      { foodCategory: { contains: query.search, mode: 'insensitive' } },
      { organization: { name: { contains: query.search, mode: 'insensitive' } } },
    ];
  }
  return donationRepo.findAll(filters);
};

const getStatusLogs = async (donationId) => {
  const donation = await donationRepo.findById(donationId);
  if (!donation) throw AppError.notFound('Donation not found');
  return donationRepo.findStatusLogs(donationId);
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

module.exports = { createDonation, listDonations, getDonation, updateDonationStatus, getNearbyRecipients, addImage, getStatusLogs };
