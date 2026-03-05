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

module.exports = { summary, daily };
