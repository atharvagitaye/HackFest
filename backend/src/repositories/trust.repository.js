const prisma = require('../config/prisma');

const upsertTrustMetrics = (userId, data) =>
  prisma.trustMetric.upsert({
    where: { userId },
    create: { userId, ...data, lastUpdated: new Date() },
    update: { ...data, lastUpdated: new Date() },
  });

const getTrustMetrics = (userId) =>
  prisma.trustMetric.findUnique({ where: { userId } });

const updateUserTrustScore = (userId, trustScore) =>
  prisma.user.update({ where: { id: userId }, data: { trustScore } });

module.exports = { upsertTrustMetrics, getTrustMetrics, updateUserTrustScore };
