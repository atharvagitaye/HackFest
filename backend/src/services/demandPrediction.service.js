/**
 * DEMAND PREDICTION SERVICE
 * 
 * Algorithmic prediction of recipient demand patterns.
 * Can be replaced with ML microservice in the future.
 * 
 * Calculates DEMAND_INDEX for recipients based on:
 * - Recent request frequency
 * - Historical request patterns
 * - Average quantity requested
 * - Organization capacity
 */

const prisma = require('../config/prisma');

/**
 * CONFIGURATION: Demand Prediction Weights
 */
const DEMAND_WEIGHTS = {
  recent7Days: 0.6,     // Recent requests (more weight)
  recent30Days: 0.3,    // Historical requests
  avgQuantity: 0.1,     // Average quantity requested
};

/**
 * CONFIGURATION: Demand Thresholds
 */
const DEMAND_THRESHOLDS = {
  high: 0.7,      // >= 0.7 = High demand
  medium: 0.4,    // 0.4 - 0.7 = Medium demand
  low: 0.0,       // < 0.4 = Low demand
};

/**
 * Calculate demand index for a specific recipient.
 * 
 * @param {string} recipientId - Recipient user ID
 * @returns {Promise<{demandIndex: number, demandLevel: string, metrics: object}>}
 */
const calculateRecipientDemand = async (recipientId) => {
  const now = new Date();
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

  // Get recipient's organization details
  const recipient = await prisma.user.findUnique({
    where: { id: recipientId },
    include: { organization: true },
  });

  if (!recipient) {
    return { demandIndex: 0, demandLevel: 'unknown', metrics: {} };
  }

  // Count accepted matches (requests) in last 7 days
  const requestsLast7Days = await prisma.match.count({
    where: {
      recipientId,
      selected: true, // Only count accepted requests
      createdAt: { gte: sevenDaysAgo },
    },
  });

  // Count accepted matches in last 30 days
  const requestsLast30Days = await prisma.match.count({
    where: {
      recipientId,
      selected: true,
      createdAt: { gte: thirtyDaysAgo },
    },
  });

  // Get average quantity requested from accepted matches
  const acceptedDeliveries = await prisma.delivery.findMany({
    where: {
      recipientId,
      donation: {
        createdAt: { gte: thirtyDaysAgo },
      },
    },
    include: {
      donation: { select: { quantityKg: true } },
    },
  });

  const totalQuantity = acceptedDeliveries.reduce(
    (sum, d) => sum + (d.donation.quantityKg || 0), 
    0
  );
  const avgQuantityRequested = acceptedDeliveries.length > 0 
    ? totalQuantity / acceptedDeliveries.length 
    : 0;

  // Normalize metrics (0-1 scale)
  // Assume max 10 requests per week, 30 per month as high demand
  const normalizedRecent7 = Math.min(1.0, requestsLast7Days / 10);
  const normalizedRecent30 = Math.min(1.0, requestsLast30Days / 30);
  
  // Normalize quantity by organization capacity (if available)
  const maxCapacity = recipient.organization?.maxCapacityKg || 100; // Default 100kg
  const normalizedQuantity = Math.min(1.0, avgQuantityRequested / maxCapacity);

  // Calculate weighted demand index
  const demandIndex = 
    (normalizedRecent7 * DEMAND_WEIGHTS.recent7Days) +
    (normalizedRecent30 * DEMAND_WEIGHTS.recent30Days) +
    (normalizedQuantity * DEMAND_WEIGHTS.avgQuantity);

  // Classify demand level
  let demandLevel = 'low';
  if (demandIndex >= DEMAND_THRESHOLDS.high) {
    demandLevel = 'high';
  } else if (demandIndex >= DEMAND_THRESHOLDS.medium) {
    demandLevel = 'medium';
  }

  return {
    demandIndex: parseFloat(demandIndex.toFixed(4)),
    demandLevel,
    metrics: {
      requestsLast7Days,
      requestsLast30Days,
      avgQuantityRequested: parseFloat(avgQuantityRequested.toFixed(2)),
      organizationCapacity: maxCapacity,
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
 * Get demand indices for all active recipients.
 * Useful for identifying high-demand zones/organizations.
 * 
 * @param {object} options - Filter options
 * @returns {Promise<Array>}
 */
const getAllRecipientDemands = async (options = {}) => {
  const { minDemandLevel = 'low', limit = 50 } = options;

  // Get all RECIPIENT users
  const recipients = await prisma.user.findMany({
    where: { role: 'RECIPIENT' },
    include: { organization: true },
    take: limit,
  });

  // Calculate demand for each recipient
  const demands = await Promise.all(
    recipients.map(async (r) => {
      const demand = await calculateRecipientDemand(r.id);
      return {
        recipientId: r.id,
        name: r.name,
        organizationName: r.organization?.name,
        ...demand,
      };
    })
  );

  // Filter by minimum demand level if specified
  const demandLevelOrder = { low: 0, medium: 1, high: 2 };
  const minLevel = demandLevelOrder[minDemandLevel] || 0;

  return demands
    .filter(d => demandLevelOrder[d.demandLevel] >= minLevel)
    .sort((a, b) => b.demandIndex - a.demandIndex); // Sort by demand (highest first)
};

/**
 * Identify high-demand geographic zones.
 * Groups recipients by proximity and calculates aggregate demand.
 * 
 * @returns {Promise<Array>} High-demand zones with location and demand metrics
 */
const identifyHighDemandZones = async () => {
  // Get all recipients with demand data
  const demands = await getAllRecipientDemands({ minDemandLevel: 'medium' });

  // Group by approximate location (simple grid-based clustering)
  // In production, use proper clustering algorithms (DBSCAN, K-means)
  const zones = {};
  
  demands.forEach(d => {
    const recipient = d;
    // Simple zone identifier (round lat/lng to 0.1 degree precision ~11km)
    // This groups nearby recipients together
    if (recipient.organization?.latitude && recipient.organization?.longitude) {
      const lat = Math.round(recipient.organization.latitude * 10) / 10;
      const lng = Math.round(recipient.organization.longitude * 10) / 10;
      const zoneKey = `${lat},${lng}`;
      
      if (!zones[zoneKey]) {
        zones[zoneKey] = {
          zoneId: zoneKey,
          centerLat: lat,
          centerLng: lng,
          recipients: [],
          totalDemandIndex: 0,
          avgDemandIndex: 0,
        };
      }
      
      zones[zoneKey].recipients.push(recipient);
      zones[zoneKey].totalDemandIndex += recipient.demandIndex;
    }
  });

  // Calculate averages and sort
  return Object.values(zones)
    .map(zone => ({
      ...zone,
      recipientCount: zone.recipients.length,
      avgDemandIndex: parseFloat((zone.totalDemandIndex / zone.recipients.length).toFixed(4)),
    }))
    .filter(zone => zone.recipientCount >= 2) // Only zones with multiple recipients
    .sort((a, b) => b.avgDemandIndex - a.avgDemandIndex)
    .slice(0, 10); // Top 10 zones
};

module.exports = {
  calculateRecipientDemand,
  getAllRecipientDemands,
  identifyHighDemandZones,
  DEMAND_WEIGHTS,
  DEMAND_THRESHOLDS,
};
