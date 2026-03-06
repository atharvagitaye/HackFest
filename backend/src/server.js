const app = require('./app');
const config = require('./config/env');
const prisma = require('./config/prisma');
const donationRepo = require('./repositories/donation.repository');

const PORT = config.port;

/** Expire stale donations every 5 minutes */
const startExpiryCron = () => {
  setInterval(async () => {
    try {
      const result = await donationRepo.expireStale();
      if (result.count > 0) console.log(`[cron] Expired ${result.count} stale donation(s)`);
    } catch (err) {
      console.error('[cron] Expiry job failed:', err.message);
    }
  }, 5 * 60 * 1000); // every 5 min
};

const start = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
    startExpiryCron();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} [${config.nodeEnv}]`);
      console.log(`📖 Swagger docs: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`\n${signal} received — shutting down gracefully`);
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start();
