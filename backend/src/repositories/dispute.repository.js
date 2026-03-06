const prisma = require('../config/prisma');

const create = (data) =>
  prisma.dispute.create({ 
    data,
    include: {
      delivery: {
        include: {
          donation: {
            include: {
              donor: { select: { id: true, name: true, email: true } },
              organization: true,
            },
          },
          recipient: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

const findById = (id) =>
  prisma.dispute.findUnique({ 
    where: { id },
    include: {
      delivery: {
        include: {
          donation: {
            include: {
              donor: { select: { id: true, name: true, email: true } },
              organization: true,
            },
          },
          recipient: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

const findByDelivery = (deliveryId) =>
  prisma.dispute.findMany({
    where: { deliveryId },
    include: {
      delivery: {
        include: {
          donation: { include: { donor: true, organization: true } },
          recipient: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

const findByUser = (userId) =>
  prisma.dispute.findMany({
    where: { reportedBy: userId },
    include: {
      delivery: {
        include: {
          donation: { include: { donor: true, organization: true } },
          recipient: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

const listAll = (filters = {}) => {
  const where = {};
  if (filters.status) where.status = filters.status;
  if (filters.category) where.category = filters.category;
  
  return prisma.dispute.findMany({
    where,
    include: {
      delivery: {
        include: {
          donation: {
            include: {
              donor: { select: { id: true, name: true, email: true } },
              organization: true,
            },
          },
          recipient: { select: { id: true, name: true, email: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const resolve = (id, resolvedBy, resolution) =>
  prisma.dispute.update({
    where: { id },
    data: {
      status: 'RESOLVED',
      resolution,
      resolvedBy,
      resolvedAt: new Date(),
    },
  });

const dismiss = (id, resolvedBy, resolution) =>
  prisma.dispute.update({
    where: { id },
    data: {
      status: 'DISMISSED',
      resolution,
      resolvedBy,
      resolvedAt: new Date(),
    },
  });

const updateStatus = (id, status) =>
  prisma.dispute.update({
    where: { id },
    data: { status },
  });

module.exports = {
  create,
  findById,
  findByDelivery,
  findByUser,
  listAll,
  resolve,
  dismiss,
  updateStatus,
};
