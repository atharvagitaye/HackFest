const ratingRepo = require('../repositories/rating.repository');
const donationRepo = require('../repositories/donation.repository');
const trustService = require('./trust.service');
const AppError = require('../utils/AppError');

const submitRating = async ({ donationId, fromUser, toUser, rating, feedback }) => {
  const donation = await donationRepo.findById(donationId);
  if (!donation) throw AppError.notFound('Donation not found');
  if (donation.status !== 'DELIVERED') {
    throw AppError.badRequest('Ratings can only be submitted for delivered donations');
  }

  if (fromUser === toUser) {
    throw AppError.badRequest('Cannot rate yourself');
  }

  const existing = await ratingRepo.findExisting(donationId, fromUser);
  if (existing) throw AppError.badRequest('You have already rated this donation');

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw AppError.badRequest('Rating must be an integer between 1 and 5');
  }

  const created = await ratingRepo.create({ donationId, fromUser, toUser, rating, feedback });

  // Recalculate trust metrics for the recipient
  await trustService.updateTrustMetrics(toUser);

  return created;
};

const getRatingsForDonation = (donationId) => ratingRepo.findByDonation(donationId);

module.exports = { submitRating, getRatingsForDonation };
