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

/**
 * Returns daily impact records for the last `days` days.
 * Falls back to computing from deliveries if DailyImpact table is empty.
 */
const getDailyImpact = async (days = 30) => {
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  const rows = await prisma.dailyImpact.findMany({
    where: { date: { gte: since } },
    orderBy: { date: 'asc' },
  });

  // If we have seeded data use it; otherwise compute from deliveries per day
  if (rows.length > 0) {
    return rows.map((r) => ({
      date: r.date.toISOString().slice(0, 10),
      month: r.date.toLocaleString('default', { month: 'short' }),
      kgSaved: r.kgSaved ?? 0,
      mealsServed: r.mealsServed ?? 0,
      co2Reduced: r.co2Reduced ?? 0,
    }));
  }

  // Fallback: aggregate delivered donations by day
  const deliveries = await prisma.delivery.findMany({
    where: { completed: true, deliveryTime: { gte: since } },
    include: { donation: { select: { quantityKg: true } } },
  });

  const byDay = {};
  for (const d of deliveries) {
    const key = d.deliveryTime.toISOString().slice(0, 10);
    if (!byDay[key]) byDay[key] = { kgSaved: 0, mealsServed: 0, co2Reduced: 0 };
    const kg = d.donation?.quantityKg ?? 0;
    byDay[key].kgSaved += kg;
    byDay[key].mealsServed += Math.round(kg / 0.5);
    byDay[key].co2Reduced += parseFloat((kg * 2.5).toFixed(2));
  }

  return Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => ({
      date,
      month: new Date(date).toLocaleString('default', { month: 'short' }),
      ...vals,
    }));
};

const computeUserImpact = async (userId, role) => {
  if (role === 'DONOR') {
    const donations = await prisma.donation.findMany({
      where: { donorId: userId, status: 'DELIVERED' },
      select: { quantityKg: true, estimatedMeals: true },
    });
    const kgSaved = donations.reduce((s, d) => s + (d.quantityKg ?? 0), 0);
    const mealsEnabled = donations.reduce((s, d) => s + (d.estimatedMeals ?? Math.round((d.quantityKg ?? 0) / 0.5)), 0);
    return {
      totalKgSaved: parseFloat(kgSaved.toFixed(2)),
      estimatedMealsSaved: mealsEnabled,
      estimatedCo2Reduced: parseFloat((kgSaved * 2.5).toFixed(2)),
      totalSuccessfulDeliveries: donations.length,
    };
  }
  // RECIPIENT
  const deliveries = await prisma.delivery.findMany({
    where: { recipientId: userId, completed: true },
    include: { donation: { select: { quantityKg: true } } },
  });
  const kgReceived = deliveries.reduce((s, d) => s + (d.donation?.quantityKg ?? 0), 0);
  return {
    totalKgSaved: parseFloat(kgReceived.toFixed(2)),
    estimatedMealsSaved: Math.round(kgReceived / 0.5),
    estimatedCo2Reduced: parseFloat((kgReceived * 2.5).toFixed(2)),
    totalSuccessfulDeliveries: deliveries.length,
  };
};

/**
 * Get top donors leaderboard
 * @param {string} period - 'all' | 'weekly' | 'monthly'
 * @param {number} limit - number of top users to return
 */
const getTopDonors = async (period = 'all', limit = 10) => {
  let dateFilter = {};
  
  if (period === 'weekly') {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    dateFilter = { createdAt: { gte: weekAgo } };
  } else if (period === 'monthly') {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    dateFilter = { createdAt: { gte: monthAgo } };
  }

  const donors = await prisma.user.findMany({
    where: { 
      role: 'DONOR',
      donations: {
        some: {
          status: 'DELIVERED',
          ...dateFilter,
        },
      },
    },
    select: {
      id: true,
      name: true,
      trustScore: true,
      organization: { select: { name: true } },
      donations: {
        where: { 
          status: 'DELIVERED',
          ...dateFilter,
        },
        select: { quantityKg: true, estimatedMeals: true },
      },
    },
    take: limit * 3, // Get more to sort accurately
  });

  const leaderboard = donors.map(donor => {
    const totalKg = donor.donations.reduce((sum, d) => sum + (d.quantityKg ?? 0), 0);
    const totalMeals = donor.donations.reduce((sum, d) => sum + (d.estimatedMeals ?? Math.round((d.quantityKg ?? 0) / 0.5)), 0);
    const totalDonations = donor.donations.length;
    
    return {
      userId: donor.id,
      name: donor.name,
      organizationName: donor.organization?.name,
      totalKgSaved: parseFloat(totalKg.toFixed(2)),
      totalMealsSaved: totalMeals,
      totalDonations,
      trustScore: donor.trustScore,
    };
  })
  .sort((a, b) => b.totalKgSaved - a.totalKgSaved)
  .slice(0, limit);

  return leaderboard;
};

/**
 * Get top recipients leaderboard
 * @param {string} period - 'all' | 'weekly' | 'monthly'
 * @param {number} limit - number of top users to return
 */
const getTopRecipients = async (period = 'all', limit = 10) => {
  let dateFilter = {};
  
  if (period === 'weekly') {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    dateFilter = { deliveryTime: { gte: weekAgo } };
  } else if (period === 'monthly') {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    dateFilter = { deliveryTime: { gte: monthAgo } };
  }

  const recipients = await prisma.user.findMany({
    where: { 
      role: 'RECIPIENT',
      deliveries: {
        some: {
          completed: true,
          ...dateFilter,
        },
      },
    },
    select: {
      id: true,
      name: true,
      trustScore: true,
      organization: { select: { name: true } },
      deliveries: {
        where: { 
          completed: true,
          ...dateFilter,
        },
        include: { donation: { select: { quantityKg: true } } },
      },
    },
    take: limit * 3,
  });

  const leaderboard = recipients.map(recipient => {
    const totalKg = recipient.deliveries.reduce((sum, d) => sum + (d.donation?.quantityKg ?? 0), 0);
    const totalMeals = Math.round(totalKg / 0.5);
    const totalDeliveries = recipient.deliveries.length;
    
    return {
      userId: recipient.id,
      name: recipient.name,
      organizationName: recipient.organization?.name,
      totalKgReceived: parseFloat(totalKg.toFixed(2)),
      totalMealsServed: totalMeals,
      totalDeliveries,
      trustScore: recipient.trustScore,
    };
  })
  .sort((a, b) => b.totalKgReceived - a.totalKgReceived)
  .slice(0, limit);

  return leaderboard;
};

module.exports = { computeSummary, getDailyImpact, computeUserImpact, getTopDonors, getTopRecipients };
