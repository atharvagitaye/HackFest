const donationService = require('../services/donation.service');
const { sendSuccess } = require('../utils/response');

const create = async (req, res, next) => {
  try {
    // If client didn't supply organizationId, fall back to the donor's own org
    const organizationId = req.body.organizationId || req.user.organizationId || null;
    const donation = await donationService.createDonation(req.user.id, {
      ...req.body,
      organizationId,
    });
    sendSuccess(res, donation, 'Donation created', 201);
  } catch (err) {
    next(err);
  }
};

const list = async (req, res, next) => {
  try {
    const donations = await donationService.listDonations(req.query);
    sendSuccess(res, donations);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const donation = await donationService.getDonation(req.params.id);
    sendSuccess(res, donation);
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const donation = await donationService.updateDonationStatus(
      req.params.id,
      req.body.status,
      req.user.id
    );
    sendSuccess(res, donation, 'Status updated');
  } catch (err) {
    next(err);
  }
};

const nearbyRecipients = async (req, res, next) => {
  try {
    const recipients = await donationService.getNearbyRecipients(req.params.id);
    sendSuccess(res, recipients);
  } catch (err) {
    next(err);
  }
};

const addImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;
    const image = await donationService.addImage(id, imageUrl);
    sendSuccess(res, image, 'Image added', 201);
  } catch (err) {
    next(err);
  }
};

module.exports = { create, list, getById, updateStatus, nearbyRecipients, addImage };
