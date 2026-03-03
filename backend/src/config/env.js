require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  matching: {
    radiusKm: parseFloat(process.env.MATCHING_RADIUS_KM) || 10,
  },
  ml: {
    serviceUrl: process.env.ML_SERVICE_URL || 'http://localhost:5001',
    modelVersion: process.env.ML_MODEL_VERSION || 'rule-based-v1',
  },
};

module.exports = config;
