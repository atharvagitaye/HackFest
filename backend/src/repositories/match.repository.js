const prisma = require('../config/prisma');

const createMany = (records) =>
  prisma.match.createMany({ data: records, skipDuplicates: true });

const findByDonation = (donationId) =>
  prisma.match.findMany({
    where: { donationId },
    include: { recipient: { select: { id: true, name: true, email: true, trustScore: true } } },
    orderBy: { predictedSuccessProbability: 'desc' },
  });

const markSelected = (id) =>
  prisma.match.update({ where: { id }, data: { selected: true } });

module.exports = { createMany, findByDonation, markSelected };
