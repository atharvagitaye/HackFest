const prisma = require('../config/prisma');

const createMany = (records) =>
  prisma.match.createMany({ data: records, skipDuplicates: true });

const findByDonation = (donationId) =>
  prisma.match.findMany({
    where: { donationId },
    include: { recipient: { select: { id: true, name: true, email: true, trustScore: true } } },
    orderBy: { predictedSuccessProbability: 'desc' },
  });

const findById = (id) =>
  prisma.match.findUnique({
    where: { id },
    include: {
      donation: true,
      recipient: { select: { id: true, name: true, email: true, trustScore: true } },
    },
  });

const markSelected = (id) =>
  prisma.match.update({ where: { id }, data: { selected: true } });

const findByRecipient = (recipientId) =>
  prisma.match.findMany({
    where: { recipientId },
    include: {
      donation: {
        include: {
          organization: true,
          donor: { select: { id: true, name: true } },
          images: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

module.exports = { createMany, findByDonation, findById, markSelected, findByRecipient };
