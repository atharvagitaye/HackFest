const impactRepo = require('../repositories/impact.repository');

const getSummary = () => impactRepo.computeSummary();

module.exports = { getSummary };
