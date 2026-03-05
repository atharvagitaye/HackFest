const ratingService = require('../services/rating.service');
const { sendSuccess } = require('../utils/response');

const submit = async (req, res, next) => {
  try {
    const { donationId, toUser, rating, feedback } = req.body;
    const result = await ratingService.submitRating({
      donationId,
      fromUser: req.user.id,
      toUser,
      rating,
      feedback,
    });
    sendSuccess(res, result, 'Rating submitted', 201);
  } catch (err) {
    next(err);
  }
};

const listByDonation = async (req, res, next) => {
  try {
    const ratings = await ratingService.getRatingsForDonation(req.params.donationId);
    sendSuccess(res, ratings);
  } catch (err) {
    next(err);
  }
};

module.exports = { submit, listByDonation };
