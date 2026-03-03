const deliveryRepo = require('../repositories/delivery.repository');
const donationRepo = require('../repositories/donation.repository');
const trustService = require('./trust.service');
const AppError = require('../utils/AppError');

const startDelivery = async ({ donationId, recipientId }) => {
  const donation = await donationRepo.findById(donationId);
  if (!donation) throw AppError.notFound('Donation not found');
  if (donation.status !== 'ACCEPTED') {
    throw AppError.badRequest('Delivery can only start when donation status is ACCEPTED');
  }

  const delivery = await deliveryRepo.create({
    donationId,
    recipientId,
    pickupTime: new Date(),
    status: 'IN_PROGRESS',
  });

  // Advance donation status to PICKED_UP
  await donationRepo.updateStatus(donationId, 'PICKED_UP');
  await donationRepo.createStatusLog({
    donationId,
    oldStatus: 'ACCEPTED',
    newStatus: 'PICKED_UP',
    changedBy: recipientId,
  });

  return delivery;
};

const completeDelivery = async (deliveryId, userId) => {
  const delivery = await deliveryRepo.findById(deliveryId);
  if (!delivery) throw AppError.notFound('Delivery not found');
  if (delivery.completed) throw AppError.badRequest('Delivery already completed');

  const now = new Date();
  const pickupTime = new Date(delivery.pickupTime);
  const expectedDelivery = delivery.donation.pickupDeadline
    ? new Date(delivery.donation.pickupDeadline)
    : null;

  const delayMinutes = expectedDelivery
    ? Math.max(0, Math.round((now - expectedDelivery) / 60000))
    : 0;

  const updated = await deliveryRepo.complete(deliveryId, {
    deliveryTime: now,
    delayMinutes,
    completed: true,
    status: 'COMPLETED',
  });

  // Advance donation status to DELIVERED
  await donationRepo.updateStatus(delivery.donationId, 'DELIVERED');
  await donationRepo.createStatusLog({
    donationId: delivery.donationId,
    oldStatus: 'PICKED_UP',
    newStatus: 'DELIVERED',
    changedBy: userId,
  });

  // Recalculate trust score for recipient
  await trustService.updateTrustMetrics(delivery.recipientId);

  return updated;
};

module.exports = { startDelivery, completeDelivery };
