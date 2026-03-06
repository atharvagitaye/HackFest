const impactRepo = require('../repositories/impact.repository');

const getSummary = () => impactRepo.computeSummary();
const getDailyImpact = (days) => impactRepo.getDailyImpact(days);
const getUserImpact = (userId, role) => impactRepo.computeUserImpact(userId, role);

module.exports = { getSummary, getDailyImpact, getUserImpact };
