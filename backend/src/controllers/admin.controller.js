const prisma = require('../config/prisma');
const { sendSuccess } = require('../utils/response');
const AppError = require('../utils/AppError');

// ── Users ─────────────────────────────────────────────────────────────────────

const listUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const where = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        trustScore: true,
        phone: true,
        createdAt: true,
        organizationId: true,
        organization: { select: { id: true, name: true, type: true } },
        _count: { select: { donations: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    sendSuccess(res, users);
  } catch (err) {
    next(err);
  }
};

const verifyUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { verified } = req.body;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return next(AppError.notFound('User not found'));
    const updated = await prisma.user.update({
      where: { id },
      data: { isVerified: Boolean(verified) },
      select: { id: true, name: true, email: true, isVerified: true, role: true },
    });
    sendSuccess(res, updated, `User ${updated.isVerified ? 'verified' : 'unverified'} successfully`);
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return next(AppError.notFound('User not found'));
    if (user.id === req.user.id) return next(AppError.badRequest('Cannot delete yourself'));
    // Nullify organizationId to allow org deletion cascade
    await prisma.user.update({ where: { id }, data: { organizationId: null } });
    await prisma.user.delete({ where: { id } });
    sendSuccess(res, null, 'User deleted');
  } catch (err) {
    next(err);
  }
};

// ── Donations ─────────────────────────────────────────────────────────────────

const listAllDonations = async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;
    const donations = await prisma.donation.findMany({
      where,
      include: {
        donor: { select: { id: true, name: true, email: true } },
        organization: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    sendSuccess(res, donations);
  } catch (err) {
    next(err);
  }
};

// ── Platform Stats ─────────────────────────────────────────────────────────────

const getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalDonations, totalOrganizations, pendingVerification] = await Promise.all([
      prisma.user.count(),
      prisma.donation.count(),
      prisma.organization.count(),
      prisma.user.count({ where: { isVerified: false, role: { not: 'ADMIN' } } }),
    ]);
    sendSuccess(res, { totalUsers, totalDonations, totalOrganizations, pendingVerification });
  } catch (err) {
    next(err);
  }
};

module.exports = { listUsers, verifyUser, deleteUser, listAllDonations, getStats };
