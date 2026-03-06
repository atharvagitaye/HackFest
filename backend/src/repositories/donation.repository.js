const prisma = require('../config/prisma');
const { haversineDistance } = require('../utils/distance');

const create = (data) =>
  prisma.donation.create({
    data,
    include: { organization: true, images: true },
  });

const findAll = (filters = {}) =>
  prisma.donation.findMany({
    where: filters,
    include: { donor: { select: { id: true, name: true, trustScore: true } }, organization: true, images: true },
    orderBy: { createdAt: 'desc' },
  });

const findById = (id) =>
  prisma.donation.findUnique({
    where: { id },
    include: {
      donor: { select: { id: true, name: true, trustScore: true } },
      organization: true,
      images: true,
      matches: true,
    },
  });

const updateStatus = (id, status) =>
  prisma.donation.update({ where: { id }, data: { status } });

const createStatusLog = (data) =>
  prisma.statusLog.create({ data });

/**
 * Find recipient organizations within a radius of a donation's coordinates.
 * Fetches all RECIPIENTs with lat/lng from their organization and filters in-process.
 */
const findNearbyRecipients = async (donation, radiusKm) => {
  if (!donation.latitude || !donation.longitude) return [];

  // Get all RECIPIENT users who have a linked organization with location data
  const recipients = await prisma.user.findMany({
    where: { role: 'RECIPIENT', organizationId: { not: null } },
    include: {
      organization: true,
      trustMetrics: true,
    },
  });

  const results = [];
  for (const recipient of recipients) {
    const org = recipient.organization;
    if (!org || !org.latitude || !org.longitude) continue;

    const distance = haversineDistance(
      donation.latitude,
      donation.longitude,
      org.latitude,
      org.longitude
    );

    if (distance <= radiusKm) {
      results.push({
        recipientId: recipient.id,
        name: recipient.name,
        email: recipient.email,
        trustScore: recipient.trustScore,
        organizationId: org.id,
        organizationName: org.name,
        maxCapacityKg: org.maxCapacityKg,
        distance_km: parseFloat(distance.toFixed(2)),
      });
    }
  }

  return results.sort((a, b) => a.distance_km - b.distance_km);
};

const addImage = (donationId, imageUrl) =>
  prisma.donationImage.create({ data: { donationId, imageUrl } });

const findStatusLogs = (donationId) =>
  prisma.statusLog.findMany({
    where: { donationId },
    orderBy: { changedAt: 'asc' },
    include: { changer: { select: { id: true, name: true, role: true } } },
  });

const expireStale = () =>
  prisma.donation.updateMany({
    where: {
      status: { in: ['REPORTED', 'MATCHED'] },
      expiryTime: { lt: new Date() },
    },
    data: { status: 'EXPIRED' },
  });

module.exports = { create, findAll, findById, updateStatus, createStatusLog, findNearbyRecipients, addImage, findStatusLogs, expireStale };
