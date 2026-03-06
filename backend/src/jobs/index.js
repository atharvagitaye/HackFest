/**
 * BACKGROUND JOBS
 * 
 * Scheduled tasks for system maintenance and automation.
 * Uses node-cron for periodic job execution.
 */

const cron = require('node-cron');
const donationRepo = require('../repositories/donation.repository');
const trustService = require('../services/trust.service');
const config = require('../config/env');

/**
 * Job: Expire stale donations
 * Runs every hour
 * Marks donations as EXPIRED if they're past expiry time
 */
const expireStaleDonations = cron.schedule('0 * * * *', async () => {
  if (config.nodeEnv === 'test') return; // Skip in test environment
  
  try {
    console.log('[CRON] Running expired donations cleanup...');
    const result = await donationRepo.expireStale();
    console.log(`[CRON] Expired ${result.count} stale donations`);
  } catch (error) {
    console.error('[CRON] Error expiring donations:', error.message);
  }
});

/**
 * Job: Recalculate trust scores
 * Runs daily at 2 AM
 * Updates trust metrics for all active users
 */
const recalculateTrustScores = cron.schedule('0 2 * * *', async () => {
  if (config.nodeEnv === 'test') return;
  
  try {
    console.log('[CRON] Recalculating trust scores...');
    
    // Get all users with completed deliveries
    const prisma = require('../config/prisma');
    const activeUsers = await prisma.delivery.findMany({
      where: { completed: true },
      select: { recipientId: true },
      distinct: ['recipientId'],
    });
    
    let updated = 0;
    for (const user of activeUsers) {
      try {
        await trustService.updateTrustMetrics(user.recipientId);
        updated++;
      } catch (err) {
        console.error(`[CRON] Failed to update trust for user ${user.recipientId}:`, err.message);
      }
    }
    
    console.log(`[CRON] Updated trust scores for ${updated} users`);
  } catch (error) {
    console.error('[CRON] Error recalculating trust scores:', error.message);
  }
});

/**
 * Job: Update impact metrics
 * Runs daily at 3 AM
 * Aggregates platform-wide impact statistics
 */
const updateImpactMetrics = cron.schedule('0 3 * * *', async () => {
  if (config.nodeEnv === 'test') return;
  
  try {
    console.log('[CRON] Updating impact metrics...');
    const impactService = require('../services/impact.service');
    
    // This would trigger a full recalculation of global metrics
    // For now, impact is calculated on-demand
    // Future: Pre-calculate and cache for performance
    
    console.log('[CRON] Impact metrics update complete');
  } catch (error) {
    console.error('[CRON] Error updating impact metrics:', error.message);
  }
});

/**
 * Initialize all background jobs
 */
const initializeJobs = () => {
  console.log('[JOBS] Initializing background jobs...');
  
  // Start all jobs
  expireStaleDonations.start();
  recalculateTrustScores.start();
  updateImpactMetrics.start();
  
  console.log('[JOBS] Background jobs initialized:');
  console.log('  ✓ Expire stale donations (hourly)');
  console.log('  ✓ Recalculate trust scores (daily 2 AM)');
  console.log('  ✓ Update impact metrics (daily 3 AM)');
};

/**
 * Stop all background jobs (for graceful shutdown)
 */
const stopJobs = () => {
  console.log('[JOBS] Stopping background jobs...');
  expireStaleDonations.stop();
  recalculateTrustScores.stop();
  updateImpactMetrics.stop();
  console.log('[JOBS] All background jobs stopped');
};

module.exports = {
  initializeJobs,
  stopJobs,
  // Export individual jobs for testing
  expireStaleDonations,
  recalculateTrustScores,
  updateImpactMetrics,
};
