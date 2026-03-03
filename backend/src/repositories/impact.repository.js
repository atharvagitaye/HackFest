const prisma = require('../config/prisma');

/**
 * Dynamically computes platform-wide impact from DB.
 * No precomputed table used — always fresh.
 */
const computeSummary = async () => {
  const deliveredDonations = await prisma.donation.findMany({
    where: { status: 'DELIVERED' },
    select: { quantityKg: true },
  });

  const totalKgSaved = deliveredDonations.reduce((sum, d) => sum + (d.quantityKg ?? 0), 0);
  const totalSuccessfulDeliveries = deliveredDonations.length;
  const estimatedMealsSaved = totalKgSaved / 0.5;
  const estimatedCo2Reduced = totalKgSaved * 2.5;

  return {
    totalKgSaved: parseFloat(totalKgSaved.toFixed(2)),
    estimatedMealsSaved: Math.round(estimatedMealsSaved),
    estimatedCo2Reduced: parseFloat(estimatedCo2Reduced.toFixed(2)),
    totalSuccessfulDeliveries,
  };
};

module.exports = { computeSummary };
