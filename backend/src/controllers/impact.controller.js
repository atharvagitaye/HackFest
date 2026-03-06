const impactService = require('../services/impact.service');
const { sendSuccess } = require('../utils/response');

const summary = async (req, res, next) => {
  try {
    const data = await impactService.getSummary();
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

const daily = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const data = await impactService.getDailyImpact(days);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

const myImpact = async (req, res, next) => {
  try {
    const data = await impactService.getUserImpact(req.user.id, req.user.role);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

const leaderboard = async (req, res, next) => {
  try {
    const { type = 'donors', period = 'all', limit = 10 } = req.query;
    const data = await impactService.getLeaderboard(type, period, parseInt(limit) || 10);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

module.exports = { summary, daily, myImpact, leaderboard };
