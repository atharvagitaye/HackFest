const deliveryService = require('../services/delivery.service');
const deliveryRepo = require('../repositories/delivery.repository');
const { sendSuccess } = require('../utils/response');

const start = async (req, res, next) => {
  try {
    // Disable direct pickup - must use QR code scanning
    return next(require('../utils/AppError').badRequest(
      'Direct pickup is disabled. Please scan the donor\'s QR code to confirm pickup.'
    ));
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
    let deliveries;
    if (req.user.role === 'DONOR') {
      deliveries = await deliveryRepo.findByDonor(req.user.id);
    } else if (req.user.role === 'RECIPIENT') {
      deliveries = await deliveryRepo.findByRecipient(req.user.id);
    } else {
      // ADMIN can see all - we'll add this later if needed
      deliveries = [];
    }
    sendSuccess(res, deliveries);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const delivery = await deliveryRepo.findById(req.params.id);
    if (!delivery) return next(require('../utils/AppError').notFound('Delivery not found'));
    
    // Authorization: Allow recipient, donor of the donation, or admin
    const isRecipient = delivery.recipientId === req.user.id;
    const isDonor = delivery.donation?.donorId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';
    
    if (!isRecipient && !isDonor && !isAdmin) {
      return next(require('../utils/AppError').forbidden('Not authorized to view this delivery'));
    }
    
    sendSuccess(res, delivery);
  } catch (err) {
    next(err);
  }
};

const confirmPickupByQR = async (req, res, next) => {
  try {
    const { qrToken } = req.body;
    const delivery = await deliveryService.confirmPickupByQR(qrToken, req.user.id);
    sendSuccess(res, delivery, 'Pickup confirmed via QR code');
  } catch (err) {
    next(err);
  }
};

const getByQRToken = async (req, res, next) => {
  try {
    const { token } = req.params;
    const delivery = await deliveryService.getDeliveryByQR(token);
    sendSuccess(res, delivery);
  } catch (err) {
    next(err);
  }
};

module.exports = { start, complete, list, getById, confirmPickupByQR, getByQRToken };
