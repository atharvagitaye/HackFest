const deliveryRepo = require('../repositories/delivery.repository');
const donationRepo = require('../repositories/donation.repository');
const trustService = require('./trust.service');
const AppError = require('../utils/AppError');
const notifService = require('./notification.service');

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

  // Notify donor that pickup has started
  notifService.push(
    donation.donorId,
    'PICKUP_STARTED',
    'Pickup Started',
    `A recipient has started picking up your donation of ${donation.foodCategory ?? 'food'}.`,
    { href: '/delivery', meta: { donationId } }
  );

  return delivery;
};

const completeDelivery = async (deliveryId, userId) => {
  const delivery = await deliveryRepo.findById(deliveryId);
  if (!delivery) throw AppError.notFound('Delivery not found');
  if (delivery.recipientId !== userId) throw AppError.forbidden('Not your delivery');
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

  // Notify donor that delivery is complete
  notifService.push(
    delivery.donation.donorId,
    'DELIVERY_COMPLETED',
    'Delivery Completed',
    `Your donation of ${delivery.donation.foodCategory ?? 'food'} was successfully delivered. Thank you!`,
    { href: '/my-donations', meta: { donationId: delivery.donationId } }
  );

  return updated;
};

const confirmPickupByQR = async (qrToken, userId) => {
  const delivery = await deliveryRepo.confirmPickup(qrToken, userId);
  if (!delivery) throw AppError.notFound('Invalid QR code or delivery not found');

  // Update donation status to PICKED_UP
  await donationRepo.updateStatus(delivery.donationId, 'PICKED_UP');
  await donationRepo.createStatusLog({
    donationId: delivery.donationId,
    oldStatus: delivery.donation.status,
    newStatus: 'PICKED_UP',
    changedBy: userId,
  });

  // Notify recipient that QR scan was confirmed; notify donor too
  notifService.push(
    userId,
    'QR_VERIFIED',
    'Pickup Confirmed via QR',
    `You successfully scanned the QR code and confirmed pickup of ${delivery.donation?.foodCategory ?? 'the donation'}.`,
    { href: `/delivery/${delivery.id}`, meta: { deliveryId: delivery.id } }
  );
  notifService.push(
    delivery.donation.donorId,
    'QR_VERIFIED',
    'QR Code Scanned',
    `The recipient scanned your QR code and confirmed pickup of ${delivery.donation?.foodCategory ?? 'your donation'}.`,
    { href: `/delivery/${delivery.id}`, meta: { deliveryId: delivery.id } }
  );

  return delivery;
};

const getDeliveryByQR = async (qrToken) => {
  const delivery = await deliveryRepo.findByQRToken(qrToken);
  if (!delivery) throw AppError.notFound('Invalid QR code or delivery not found');
  return delivery;
};

module.exports = { startDelivery, completeDelivery, confirmPickupByQR, getDeliveryByQR };
