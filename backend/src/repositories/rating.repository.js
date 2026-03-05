const prisma = require('../config/prisma');

const create = (data) =>
  prisma.rating.create({
    data,
    include: {
      from: { select: { id: true, name: true } },
      to: { select: { id: true, name: true } },
    },
  });

const findByDonation = (donationId) =>
  prisma.rating.findMany({
    where: { donationId },
    include: {
      from: { select: { id: true, name: true } },
      to: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

const findExisting = (donationId, fromUser) =>
  prisma.rating.findFirst({ where: { donationId, fromUser } });

module.exports = { create, findByDonation, findExisting };
