const impactRepo = require('../repositories/impact.repository');

const getSummary = () => impactRepo.computeSummary();
const getDailyImpact = (days) => impactRepo.getDailyImpact(days);
const getUserImpact = (userId, role) => impactRepo.computeUserImpact(userId, role);
const getLeaderboard = (type, period, limit) => {
  if (type === 'donors') return impactRepo.getTopDonors(period, limit);
  if (type === 'recipients') return impactRepo.getTopRecipients(period, limit);
  throw new Error('Invalid leaderboard type');
};

module.exports = { getSummary, getDailyImpact, getUserImpact, getLeaderboard };
