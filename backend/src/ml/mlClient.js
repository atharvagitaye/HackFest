/**
 * ML Client — Placeholder for future ML microservice integration.
 *
 * Currently implements rule-based scoring inline.
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
 * Score match candidates.
 * @param {Array<{recipientId, distanceKm, urgencyScore, capacityFitScore, trustScore}>} features
 * @returns {Array<{recipientId, score, ...features}>}
 */
const predictMatches = async (features) => {
  // --- RULE-BASED SCORING (replace this block with ML API call later) ---
  return features.map((f) => {
    const distanceScore = Math.max(0, 1 - f.distanceKm / 50); // normalise over 50 km
    const score =
      distanceScore * 0.35 +
      f.urgencyScore * 0.30 +
      f.capacityFitScore * 0.20 +
      f.trustScore * 0.15;

    return {
      ...f,
      predictedSuccessProbability: parseFloat(score.toFixed(4)),
      modelVersion: config.ml.modelVersion,
    };
  });
  // --- END RULE-BASED SCORING ---
};

module.exports = { predictMatches };
