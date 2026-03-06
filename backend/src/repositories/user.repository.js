const prisma = require('../config/prisma');

const findByEmail = (email) =>
  prisma.user.findUnique({ where: { email } });

const findById = (id) =>
  prisma.user.findUnique({ where: { id } });

const createUser = (data) =>
  prisma.user.create({ data });

const updateVerificationStatus = (userId, status, notes) =>
  prisma.user.update({
    where: { id: userId },
    data: { 
      verificationStatus: status,
      ...(notes && { verificationNotes: notes }),
      ...(status === 'APPROVED' && { isVerified: true }),
    },
  });

const getPendingVerifications = () =>
  prisma.user.findMany({
    where: { 
      verificationStatus: 'PENDING',
      role: { in: ['DONOR', 'RECIPIENT'] },
    },
    include: { organization: true },
    orderBy: { createdAt: 'desc' },
  });

module.exports = { findByEmail, findById, createUser, updateVerificationStatus, getPendingVerifications };
