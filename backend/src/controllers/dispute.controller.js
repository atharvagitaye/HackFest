const disputeService = require('../services/dispute.service');
const { sendSuccess } = require('../utils/response');

const create = async (req, res, next) => {
  try {
    const { deliveryId, category, description } = req.body;
    const reportedBy = req.user.id;

    const dispute = await disputeService.createDispute(deliveryId, reportedBy, category, description);
    sendSuccess(res, dispute, 'Dispute reported successfully', 201);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dispute = await disputeService.getDisputeById(id, req.user.id, req.user.role);
    sendSuccess(res, dispute);
  } catch (err) {
    next(err);
  }
};

const listMine = async (req, res, next) => {
  try {
    const disputes = await disputeService.listUserDisputes(req.user.id);
    sendSuccess(res, disputes);
  } catch (err) {
    next(err);
  }
};

const listAll = async (req, res, next) => {
  try {
    const { status, category } = req.query;
    const disputes = await disputeService.listAllDisputes({ status, category });
    sendSuccess(res, disputes);
  } catch (err) {
    next(err);
  }
};

const resolve = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { resolution } = req.body;
    const resolvedBy = req.user.id;
    
    const dispute = await disputeService.resolveDispute(id, resolvedBy, resolution);
    sendSuccess(res, dispute, 'Dispute resolved successfully');
  } catch (err) {
    next(err);
  }
};

const dismiss = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { resolution } = req.body;
    const resolvedBy = req.user.id;
    
    const dispute = await disputeService.dismissDispute(id, resolvedBy, resolution);
    sendSuccess(res, dispute, 'Dispute dismissed successfully');
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const dispute = await disputeService.updateDisputeStatus(id, status);
    sendSuccess(res, dispute, 'Dispute status updated');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  create,
  getById,
  listMine,
  listAll,
  resolve,
  dismiss,
  updateStatus,
};
