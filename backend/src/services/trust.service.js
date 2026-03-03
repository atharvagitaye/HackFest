const prisma = require('../config/prisma');
const trustRepo = require('../repositories/trust.repository');

/**
 * Recalculate and persist trust metrics for a user.
 * Called after every completed delivery.
 */
const updateTrustMetrics = async (userId) => {
  // Deliveries stats for this recipient
  const [total, completed, cancelledDeliveries] = await Promise.all([
    prisma.delivery.count({ where: { recipientId: userId } }),
    prisma.delivery.count({ where: { recipientId: userId, completed: true } }),
    prisma.delivery.count({ where: { recipientId: userId, status: 'CANCELLED' } }),
  ]);

  const completionRate = total > 0 ? parseFloat((completed / total).toFixed(4)) : 0;
  const cancellationRate = total > 0 ? parseFloat((cancelledDeliveries / total).toFixed(4)) : 0;

  // Average rating received
  const ratingAgg = await prisma.rating.aggregate({
    where: { toUser: userId },
    _avg: { rating: true },
  });
  const avgRating = parseFloat((ratingAgg._avg.rating ?? 0).toFixed(4));

  // Composite trust score (0–1)
  const trustScore = parseFloat(
    (completionRate * 0.5 + (avgRating / 5) * 0.35 + (1 - cancellationRate) * 0.15).toFixed(4)
  );

  await trustRepo.upsertTrustMetrics(userId, {
    completionRate,
    avgRating,
    cancellationRate,
  });

  await trustRepo.updateUserTrustScore(userId, trustScore);

  return { completionRate, avgRating, cancellationRate, trustScore };
};

module.exports = { updateTrustMetrics };
