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

module.exports = { summary };
