const deliveryService = require('../services/delivery.service');
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

module.exports = { start, complete };
