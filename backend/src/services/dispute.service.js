const disputeRepo = require('../repositories/dispute.repository');
const deliveryRepo = require('../repositories/delivery.repository');
const AppError = require('../utils/AppError');

const createDispute = async (deliveryId, reportedBy, category, description) => {
  // Verify delivery exists
  const delivery = await deliveryRepo.findById(deliveryId);
  if (!delivery) {
    throw AppError.notFound('Delivery not found');
  }

  if (!delivery.donation) {
    throw AppError.notFound('Associated donation not found');
  }

  // Verify user is involved in this delivery (donor or recipient)
  const isDonor = delivery.donation.donorId === reportedBy;
  const isRecipient = delivery.recipientId === reportedBy;
  
  if (!isDonor && !isRecipient) {
    throw AppError.forbidden('You are not authorized to report this delivery');
  }

  const dispute = await disputeRepo.create({
    deliveryId,
    reportedBy,
    category,
    description,
  });

  return dispute;
};

const getDisputeById = async (id, userId, role) => {
  const dispute = await disputeRepo.findById(id);
  if (!dispute) {
    throw AppError.notFound('Dispute not found');
  }

  // Only allow admin or involved parties to view
  const isDonor = dispute.delivery.donation.donorId === userId;
  const isRecipient = dispute.delivery.recipientId === userId;
  const isReporter = dispute.reportedBy === userId;
  const isAdmin = role === 'ADMIN';

  if (!isDonor && !isRecipient && !isReporter && !isAdmin) {
    throw AppError.forbidden('You are not authorized to view this dispute');
  }

  return dispute;
};

const listUserDisputes = async (userId) => {
  return await disputeRepo.findByUser(userId);
};

const listAllDisputes = async (filters) => {
  return await disputeRepo.listAll(filters);
};

const resolveDispute = async (id, resolvedBy, resolution) => {
  const dispute = await disputeRepo.findById(id);
  if (!dispute) {
    throw AppError.notFound('Dispute not found');
  }

  if (dispute.status === 'RESOLVED' || dispute.status === 'DISMISSED') {
    throw AppError.badRequest('Dispute is already closed');
  }

  return await disputeRepo.resolve(id, resolvedBy, resolution);
};

const dismissDispute = async (id, resolvedBy, resolution) => {
  const dispute = await disputeRepo.findById(id);
  if (!dispute) {
    throw AppError.notFound('Dispute not found');
  }

  if (dispute.status === 'RESOLVED' || dispute.status === 'DISMISSED') {
    throw AppError.badRequest('Dispute is already closed');
  }

  return await disputeRepo.dismiss(id, resolvedBy, resolution);
};

const updateDisputeStatus = async (id, status) => {
  return await disputeRepo.updateStatus(id, status);
};

module.exports = {
  createDispute,
  getDisputeById,
  listUserDisputes,
  listAllDisputes,
  resolveDispute,
  dismissDispute,
  updateDisputeStatus,
};
