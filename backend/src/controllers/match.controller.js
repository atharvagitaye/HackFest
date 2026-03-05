const matchService = require('../services/match.service');
const { sendSuccess } = require('../utils/response');

const generate = async (req, res, next) => {
  try {
    const result = await matchService.generateMatches(req.params.donationId);
    sendSuccess(res, result, 'Matches generated', 201);
  } catch (err) {
    next(err);
  }
};

const listByDonation = async (req, res, next) => {
  try {
    const matches = await matchService.getMatchesForDonation(req.params.donationId);
    sendSuccess(res, matches);
  } catch (err) {
    next(err);
  }
};

const accept = async (req, res, next) => {
  try {
    const result = await matchService.acceptMatch(req.params.id, req.user.id);
    sendSuccess(res, result, 'Match accepted');
  } catch (err) {
    next(err);
  }
};

const reject = async (req, res, next) => {
  try {
    const result = await matchService.rejectMatch(req.params.id, req.user.id);
    sendSuccess(res, result, 'Match rejected');
  } catch (err) {
    next(err);
  }
};

module.exports = { generate, listByDonation, accept, reject };
