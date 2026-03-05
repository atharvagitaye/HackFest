const impactRepo = require('../repositories/impact.repository');

const getSummary = () => impactRepo.computeSummary();
const getDailyImpact = (days) => impactRepo.getDailyImpact(days);

module.exports = { getSummary, getDailyImpact };
