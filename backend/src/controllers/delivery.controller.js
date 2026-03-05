const deliveryService = require('../services/delivery.service');
const deliveryRepo = require('../repositories/delivery.repository');
const { sendSuccess } = require('../utils/response');

const start = async (req, res, next) => {
  try {
    const delivery = await deliveryService.startDelivery({
      donationId: req.body.donationId,
      recipientId: req.user.id,
    });
    sendSuccess(res, delivery, 'Delivery started', 201);
  } catch (err) {
    next(err);
  }
};

const complete = async (req, res, next) => {
  try {
    const delivery = await deliveryService.completeDelivery(req.body.deliveryId, req.user.id);
    sendSuccess(res, delivery, 'Delivery completed');
  } catch (err) {
    next(err);
  }
};

const list = async (req, res, next) => {
  try {
    const deliveries = await deliveryRepo.findByRecipient(req.user.id);
    sendSuccess(res, deliveries);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const delivery = await deliveryRepo.findById(req.params.id);
    if (!delivery) return next(require('../utils/AppError').notFound('Delivery not found'));
    sendSuccess(res, delivery);
  } catch (err) {
    next(err);
  }
};

module.exports = { start, complete, list, getById };
