const app = require('./app');
const config = require('./config/env');
const prisma = require('./config/prisma');
const { initializeJobs, stopJobs } = require('./jobs');

const PORT = config.port;

const start = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
    
    // Initialize background jobs (includes expiry cron + trust score updates)
    initializeJobs();

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
  stopJobs();
  await prisma.$disconnect();
  console.log('✅ Cleanup complete');
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start();

