/**
 * SURPLUS PREDICTION SERVICE
 * 
 * Algorithmic prediction of donor surplus patterns.
 * Can be replaced with ML microservice in the future.
 * 
 * Calculates SURPLUS_INDEX for donors based on:
 * - Recent donation frequency
 * - Historical donation patterns
 * - Average quantity donated
 * - Day-of-week patterns (weekends may have higher surplus)
 */

const prisma = require('../config/prisma');

/**
 * CONFIGURATION: Surplus Prediction Weights
 */
const SURPLUS_WEIGHTS = {
  recent7Days: 0.5,      // Recent donation frequency
  recent30Days: 0.3,     // Historical donation patterns
  avgQuantity: 0.2,      // Average quantity donated
};

/**
 * CONFIGURATION: Surplus Thresholds
 */
const SURPLUS_THRESHOLDS = {
  high: 0.7,      // >= 0.7 = High surplus
  medium: 0.4,    // 0.4 - 0.7 = Medium surplus
  low: 0.0,       // < 0.4 = Low surplus
};

/**
 * Day-of-week patterns (0 = Sunday, 6 = Saturday)
 * Multipliers based on typical restaurant/catering patterns
 */
const DAY_OF_WEEK_MULTIPLIERS = {
  0: 0.8,  // Sunday - lower activity
  1: 1.0,  // Monday
  2: 1.0,  // Tuesday
  3: 1.1,  // Wednesday
  4: 1.2,  // Thursday - higher
  5: 1.3,  // Friday - peak
  6: 1.1,  // Saturday - events
};

/**
 * Calculate surplus index for a specific donor/organization.
 * 
 * @param {string} donorId - Donor user ID
 * @returns {Promise<{surplusIndex: number, surplusLevel: string, metrics: object}>}
 */
const calculateDonorSurplus = async (donorId) => {
  const now = new Date();
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

  // Get donor's organization details
  const donor = await prisma.user.findUnique({
    where: { id: donorId },
    include: { organization: true },
  });

  if (!donor) {
    return { surplusIndex: 0, surplusLevel: 'unknown', metrics: {} };
  }

  // Count donations in last 7 days
  const donationsLast7Days = await prisma.donation.count({
    where: {
      donorId,
      createdAt: { gte: sevenDaysAgo },
    },
  });

  // Count donations in last 30 days
  const donationsLast30Days = await prisma.donation.count({
    where: {
      donorId,
      createdAt: { gte: thirtyDaysAgo },
    },
  });

  // Get donation data for quantity analysis
  const donations = await prisma.donation.findMany({
    where: {
      donorId,
      createdAt: { gte: thirtyDaysAgo },
    },
    select: {
      quantityKg: true,
      createdAt: true,
    },
  });

  // Calculate average quantity
  const totalQuantity = donations.reduce((sum, d) => sum + (d.quantityKg || 0), 0);
  const avgQuantityDonated = donations.length > 0 
    ? totalQuantity / donations.length 
    : 0;

  // Analyze day-of-week patterns
  const dayOfWeekCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  donations.forEach(d => {
    const day = new Date(d.createdAt).getDay();
    dayOfWeekCounts[day]++;
  });

  // Find peak donation day
  const peakDay = Object.entries(dayOfWeekCounts)
    .reduce((max, [day, count]) => count > max.count ? { day: parseInt(day), count } : max, 
            { day: 0, count: 0 });

  // Normalize metrics (0-1 scale)
  // Assume max 5 donations per week, 15 per month as high surplus
  const normalizedRecent7 = Math.min(1.0, donationsLast7Days / 5);
  const normalizedRecent30 = Math.min(1.0, donationsLast30Days / 15);
  
  // Normalize quantity (assume 50kg as high quantity per donation)
  const normalizedQuantity = Math.min(1.0, avgQuantityDonated / 50);

  // Calculate weighted surplus index
  const baseSurplusIndex = 
    (normalizedRecent7 * SURPLUS_WEIGHTS.recent7Days) +
    (normalizedRecent30 * SURPLUS_WEIGHTS.recent30Days) +
    (normalizedQuantity * SURPLUS_WEIGHTS.avgQuantity);

  // Apply day-of-week adjustment (predict today's surplus)
  const todayDay = now.getDay();
  const dayMultiplier = DAY_OF_WEEK_MULTIPLIERS[todayDay];
  const surplusIndex = Math.min(1.0, baseSurplusIndex * dayMultiplier);

  // Classify surplus level
  let surplusLevel = 'low';
  if (surplusIndex >= SURPLUS_THRESHOLDS.high) {
    surplusLevel = 'high';
  } else if (surplusIndex >= SURPLUS_THRESHOLDS.medium) {
    surplusLevel = 'medium';
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return {
    surplusIndex: parseFloat(surplusIndex.toFixed(4)),
    surplusLevel,
    metrics: {
      donationsLast7Days,
      donationsLast30Days,
      avgQuantityDonated: parseFloat(avgQuantityDonated.toFixed(2)),
      peakDonationDay: dayNames[peakDay.day],
      peakDonationCount: peakDay.count,
      todayMultiplier: dayMultiplier,
      dayOfWeekPattern: dayOfWeekCounts,
      normalizedMetrics: {
        recent7: parseFloat(normalizedRecent7.toFixed(4)),
        recent30: parseFloat(normalizedRecent30.toFixed(4)),
        quantity: parseFloat(normalizedQuantity.toFixed(4)),
      },
    },
    calculatedAt: now.toISOString(),
  };
};

/**
 * Get surplus indices for all active donors.
 * Useful for identifying surplus hotspots.
 * 
 * @param {object} options - Filter options
 * @returns {Promise<Array>}
 */
const getAllDonorSurplus = async (options = {}) => {
  const { minSurplusLevel = 'low', limit = 50 } = options;

  // Get all DONOR users
  const donors = await prisma.user.findMany({
    where: { role: 'DONOR' },
    include: { organization: true },
    take: limit,
  });

  // Calculate surplus for each donor
  const surplusData = await Promise.all(
    donors.map(async (d) => {
      const surplus = await calculateDonorSurplus(d.id);
      return {
        donorId: d.id,
        name: d.name,
        organizationName: d.organization?.name,
        organizationType: d.organization?.type,
        ...surplus,
      };
    })
  );

  // Filter by minimum surplus level if specified
  const surplusLevelOrder = { low: 0, medium: 1, high: 2 };
  const minLevel = surplusLevelOrder[minSurplusLevel] || 0;

  return surplusData
    .filter(s => surplusLevelOrder[s.surplusLevel] >= minLevel)
    .sort((a, b) => b.surplusIndex - a.surplusIndex); // Sort by surplus (highest first)
};

/**
 * Identify surplus hotspots (geographic zones with high donation activity).
 * Groups donors by proximity and calculates aggregate surplus.
 * 
 * @returns {Promise<Array>} High-surplus zones with location and surplus metrics
 */
const identifySurplusHotspots = async () => {
  // Get all donors with surplus data
  const surplusData = await getAllDonorSurplus({ minSurplusLevel: 'medium' });

  // Group by approximate location (simple grid-based clustering)
  const zones = {};
  
  surplusData.forEach(s => {
    const donor = s;
    // Simple zone identifier (round lat/lng to 0.1 degree precision ~11km)
    if (donor.organization?.latitude && donor.organization?.longitude) {
      const lat = Math.round(donor.organization.latitude * 10) / 10;
      const lng = Math.round(donor.organization.longitude * 10) / 10;
      const zoneKey = `${lat},${lng}`;
      
      if (!zones[zoneKey]) {
        zones[zoneKey] = {
          zoneId: zoneKey,
          centerLat: lat,
          centerLng: lng,
          donors: [],
          totalSurplusIndex: 0,
          avgSurplusIndex: 0,
        };
      }
      
      zones[zoneKey].donors.push(donor);
      zones[zoneKey].totalSurplusIndex += donor.surplusIndex;
    }
  });

  // Calculate averages and sort
  return Object.values(zones)
    .map(zone => ({
      ...zone,
      donorCount: zone.donors.length,
      avgSurplusIndex: parseFloat((zone.totalSurplusIndex / zone.donors.length).toFixed(4)),
    }))
    .filter(zone => zone.donorCount >= 2) // Only zones with multiple donors
    .sort((a, b) => b.avgSurplusIndex - a.avgSurplusIndex)
    .slice(0, 10); // Top 10 zones
};

/**
 * Predict surplus for a specific donor on a given day.
 * Useful for proactive planning.
 * 
 * @param {string} donorId - Donor user ID
 * @param {Date} targetDate - Date to predict for (defaults to today)
 * @returns {Promise<object>}
 */
const predictSurplusForDate = async (donorId, targetDate = new Date()) => {
  const baseSurplus = await calculateDonorSurplus(donorId);
  
  // Adjust for target day of week
  const targetDay = targetDate.getDay();
  const dayMultiplier = DAY_OF_WEEK_MULTIPLIERS[targetDay];
  
  // Remove today's multiplier and apply target day multiplier
  const todayMultiplier = DAY_OF_WEEK_MULTIPLIERS[new Date().getDay()];
  const adjustedIndex = (baseSurplus.surplusIndex / todayMultiplier) * dayMultiplier;
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  return {
    ...baseSurplus,
    surplusIndex: parseFloat(Math.min(1.0, adjustedIndex).toFixed(4)),
    predictedForDate: targetDate.toISOString(),
    predictedDay: dayNames[targetDay],
    dayMultiplier,
  };
};

module.exports = {
  calculateDonorSurplus,
  getAllDonorSurplus,
  identifySurplusHotspots,
  predictSurplusForDate,
  SURPLUS_WEIGHTS,
  SURPLUS_THRESHOLDS,
  DAY_OF_WEEK_MULTIPLIERS,
};
