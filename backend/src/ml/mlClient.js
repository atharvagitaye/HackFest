/**
 * ML Client — Placeholder for future ML microservice integration.
 *
 * Currently implements HYBRID WEIGHTED ALGORITHMIC MATCHING.
 * To swap in a real ML model, replace the body of `predictMatches`
 * with an HTTP call to the ML service URL.
 *
 * @example
 * // Future implementation:
 * // const res = await axios.post(`${config.ml.serviceUrl}/predict`, { features });
 * // return res.data.predictions;
 */

const config = require('../config/env');

/**
 * CONFIGURATION: Matching Algorithm Weights
 * These weights determine the importance of each factor in match scoring.
 * Total should sum to 1.0 for normalized scoring.
 */
const MATCHING_WEIGHTS = {
  distance: 0.35,      // Proximity between donor and recipient
  urgency: 0.25,       // Time sensitivity of the donation
  capacity: 0.20,      // How well recipient capacity matches donation quantity
  trust: 0.15,         // Recipient's trust score (reliability)
  history: 0.05,       // Historical success rate with this recipient
};

/**
 * CONFIGURATION: Scoring Parameters
 */
const SCORING_CONFIG = {
  maxDistanceKm: 50,           // Maximum distance for normalization
  maxUrgencyHours: 24,         // Maximum urgency window (24 hours)
  historicalDecayFactor: 0.9,  // Weight recent performance more heavily
  minDataPointsForHistory: 3,  // Minimum deliveries needed for reliable history score
};

/**
 * Calculate distance score (inverse relationship - closer is better).
 * @param {number} distanceKm - Distance in kilometers
 * @returns {number} Score between 0-1 (1 = very close, 0 = too far)
 */
const calculateDistanceScore = (distanceKm) => {
  if (distanceKm <= 0) return 1.0;
  if (distanceKm >= SCORING_CONFIG.maxDistanceKm) return 0.0;
  
  // Exponential decay: closer distances get disproportionately higher scores
  const normalizedDistance = distanceKm / SCORING_CONFIG.maxDistanceKm;
  return Math.pow(1 - normalizedDistance, 1.5); // Power of 1.5 for steeper decay
};

/**
 * Calculate urgency score (time-sensitive donations get priority).
 * @param {number} urgencyScore - Pre-calculated urgency (0-1)
 * @returns {number} Enhanced urgency score with non-linear scaling
 */
const calculateUrgencyScore = (urgencyScore) => {
  // Apply sigmoid-like transformation to emphasize high urgency
  // Items expiring soon get significantly higher scores
  return Math.pow(urgencyScore, 0.7); // Power < 1 for gentler curve
};

/**
 * Calculate capacity fit score (optimal load matching).
 * @param {number} capacityFitScore - How well donation fits recipient capacity
 * @param {number} donationKg - Donation quantity in kg
 * @param {number} maxCapacityKg - Recipient max capacity
 * @returns {number} Score between 0-1
 */
const calculateCapacityScore = (capacityFitScore, donationKg, maxCapacityKg) => {
  if (!maxCapacityKg || !donationKg) return 0.5; // Default if data missing
  
  const utilizationRatio = donationKg / maxCapacityKg;
  
  // Optimal utilization: 40-80% of capacity
  if (utilizationRatio >= 0.4 && utilizationRatio <= 0.8) {
    return 1.0; // Perfect fit
  } else if (utilizationRatio < 0.4) {
    // Under-utilization penalty (gentler)
    return 0.7 + (utilizationRatio / 0.4) * 0.3;
  } else if (utilizationRatio <= 1.0) {
    // Near capacity (still acceptable)
    return 0.9;
  } else {
    // Over capacity (significant penalty)
    return Math.max(0.3, 1.0 - (utilizationRatio - 1.0) * 0.5);
  }
};

/**
 * Calculate trust score with confidence intervals.
 * @param {number} trustScore - Recipient's trust score (0-1)
 * @param {number} totalDeliveries - Total deliveries for confidence
 * @returns {number} Adjusted trust score
 */
const calculateTrustScore = (trustScore, totalDeliveries = 0) => {
  if (!trustScore && trustScore !== 0) return 0.5; // Default neutral
  
  // Apply confidence penalty for new users
  let confidenceMultiplier = 1.0;
  if (totalDeliveries < 5) {
    confidenceMultiplier = 0.7 + (totalDeliveries / 5) * 0.3;
  }
  
  return trustScore * confidenceMultiplier;
};

/**
 * Calculate historical success score based on past performance.
 * @param {number} historicalSuccessRate - Success rate from past deliveries (0-1)
 * @param {number} totalDeliveries - Number of completed deliveries
 * @returns {number} Historical score with confidence adjustment
 */
const calculateHistoricalScore = (historicalSuccessRate, totalDeliveries = 0) => {
  // Not enough data points - return neutral score
  if (totalDeliveries < SCORING_CONFIG.minDataPointsForHistory) {
    return 0.5;
  }
  
  // Confidence increases with more data points (cap at 20 deliveries)
  const confidence = Math.min(1.0, totalDeliveries / 20);
  
  // Blend success rate with neutral score based on confidence
  return (historicalSuccessRate * confidence) + (0.5 * (1 - confidence));
};

/**
 * HYBRID WEIGHTED ALGORITHMIC MATCHING
 * 
 * This function scores match candidates using a weighted combination of:
 * - Proximity (distance)
 * - Time urgency
 * - Capacity fit
 * - Trust/reliability
 * - Historical success rate
 * 
 * @param {Array<Object>} features - Array of candidate features
 * @returns {Promise<Array<Object>>} Scored and ranked matches
 */
const predictMatches = async (features) => {
  // --- ALGORITHMIC SCORING (replace this block with ML API call later) ---
  
  const scoredMatches = features.map((f) => {
    // Calculate individual component scores
    const distanceScore = calculateDistanceScore(f.distanceKm);
    const urgencyScore = calculateUrgencyScore(f.urgencyScore);
    const capacityScore = calculateCapacityScore(
      f.capacityFitScore, 
      f.donationKg, 
      f.maxCapacityKg
    );
    const trustScore = calculateTrustScore(f.trustScore, f.totalDeliveries);
    const historicalScore = calculateHistoricalScore(
      f.historicalSuccessRate || 0, 
      f.totalDeliveries || 0
    );
    
    // Calculate weighted final score
    const finalScore = 
      (distanceScore * MATCHING_WEIGHTS.distance) +
      (urgencyScore * MATCHING_WEIGHTS.urgency) +
      (capacityScore * MATCHING_WEIGHTS.capacity) +
      (trustScore * MATCHING_WEIGHTS.trust) +
      (historicalScore * MATCHING_WEIGHTS.history);
    
    // Store component scores for transparency/debugging
    return {
      ...f,
      predictedSuccessProbability: parseFloat(finalScore.toFixed(4)),
      componentScores: {
        distance: parseFloat(distanceScore.toFixed(4)),
        urgency: parseFloat(urgencyScore.toFixed(4)),
        capacity: parseFloat(capacityScore.toFixed(4)),
        trust: parseFloat(trustScore.toFixed(4)),
        historical: parseFloat(historicalScore.toFixed(4)),
      },
      modelVersion: `${config.ml.modelVersion}-weighted-v2.0`,
    };
  });
  
  // Sort by score (highest first)
  return scoredMatches.sort((a, b) => 
    b.predictedSuccessProbability - a.predictedSuccessProbability
  );
  // --- END ALGORITHMIC SCORING ---
};

module.exports = { 
  predictMatches,
  // Export for testing/monitoring
  MATCHING_WEIGHTS,
  SCORING_CONFIG,
};
