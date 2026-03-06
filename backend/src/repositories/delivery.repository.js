const prisma = require('../config/prisma');
const crypto = require('crypto');

const generateQRToken = () => {
  return crypto.randomBytes(16).toString('hex'); // 32 character hex string
};

const create = (data) =>
  prisma.delivery.create({
    data: {
      ...data,
      qrToken: generateQRToken(),
    },
    include: { donation: true, recipient: { select: { id: true, name: true } } },
  });

const findById = (id) =>
  prisma.delivery.findUnique({
    where: { id },
    include: {
      donation: {
        include: {
          donor: { select: { id: true, name: true } },
          organization: { select: { id: true, name: true } },
        },
      },
      recipient: { select: { id: true, name: true } },
    },
  });

const findByQRToken = (qrToken) =>
  prisma.delivery.findUnique({
    where: { qrToken },
    include: {
      donation: {
        include: {
          donor: { select: { id: true, name: true } },
          organization: { select: { id: true, name: true } },
        },
      },
      recipient: { select: { id: true, name: true } },
    },
  });

const confirmPickup = async (qrToken, userId) => {
  const delivery = await findByQRToken(qrToken);
  if (!delivery) return null;
  
  // Verify the user is the recipient
  if (delivery.recipientId !== userId) {
    throw new Error('Unauthorized: Only the recipient can confirm pickup');
  }
  
  // Check if already picked up
  if (delivery.qrConfirmedAt || delivery.status === 'PICKED_UP') {
    throw new Error('This delivery has already been confirmed via QR code');
  }
  
  return prisma.delivery.update({
    where: { id: delivery.id },
    data: {
      qrConfirmedAt: new Date(),
      pickupTime: new Date(),
      status: 'PICKED_UP',
    },
    include: {
      donation: true,
      recipient: { select: { id: true, name: true } },
    },
  });
};

const findByDonation = (donationId) =>
  prisma.delivery.findFirst({ where: { donationId } });

const findByRecipient = (recipientId) =>
  prisma.delivery.findMany({
    where: { recipientId },
    include: {
      donation: {
        include: {
          donor: { select: { id: true, name: true } },
          organization: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { pickupTime: 'desc' },
  });

const findByDonor = (donorId) =>
  prisma.delivery.findMany({
    where: {
      donation: {
        donorId,
      },
    },
    include: {
      donation: {
        include: {
          donor: { select: { id: true, name: true } },
          organization: { select: { id: true, name: true } },
        },
      },
      recipient: { select: { id: true, name: true } },
    },
    orderBy: { pickupTime: 'desc' },
  });

const complete = (id, data) =>
  prisma.delivery.update({ where: { id }, data });

module.exports = { 
  create, 
  findById, 
  findByDonation, 
  findByRecipient,
  findByDonor,
  findByQRToken,
  confirmPickup,
  complete 
};
