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

// ── KYC Verification ───────────────────────────────────────────────────────────

const getPendingKYC = async (req, res, next) => {
  try {
    const pending = await prisma.user.findMany({
      where: {
        verificationStatus: 'PENDING',
        role: { in: ['DONOR', 'RECIPIENT'] },
      },
      include: { organization: true },
      orderBy: { createdAt: 'desc' },
    });
    sendSuccess(res, pending);
  } catch (err) {
    next(err);
  }
};

const updateKYCStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return next(AppError.badRequest('Status must be APPROVED or REJECTED'));
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return next(AppError.notFound('User not found'));

    const updated = await prisma.user.update({
      where: { id },
      data: {
        verificationStatus: status,
        verificationNotes: notes || null,
        ...(status === 'APPROVED' && { isVerified: true }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        verificationStatus: true,
        verificationNotes: true,
        isVerified: true,
      },
    });

    sendSuccess(res, updated, `KYC ${status.toLowerCase()} successfully`);
  } catch (err) {
    next(err);
  }
};

// ── Geo Heatmap Data ───────────────────────────────────────────────────────────

const getGeoHeatmap = async (req, res, next) => {
  try {
    const donations = await prisma.donation.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
      },
      select: {
        id: true,
        latitude: true,
        longitude: true,
        status: true,
        quantityKg: true,
        createdAt: true,
        organization: {
          select: { name: true, type: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 500, // Limit for performance
    });
    sendSuccess(res, donations);
  } catch (err) {
    next(err);
  }
};

// ── Expiry / Waste Report ──────────────────────────────────────────────────────

const getWasteReport = async (req, res, next) => {
  try {
    const now = new Date();
    
    // Get expired donations
    const expired = await prisma.donation.findMany({
      where: {
        expiryTime: { lt: now },
        status: { in: ['REPORTED', 'MATCHED', 'ACCEPTED'] }, // Not picked up/completed
      },
      include: {
        organization: { select: { name: true, type: true } },
        donor: { select: { name: true, email: true } },
      },
      orderBy: { expiryTime: 'desc' },
    });

    // Calculate waste stats
    const totalExpired = expired.length;
    const totalKgWasted = expired.reduce((sum, d) => sum + (d.quantityKg || 0), 0);
    const totalMealsWasted = expired.reduce((sum, d) => sum + (d.estimatedMeals || 0), 0);

    // Group by organization type
    const wasteByType = expired.reduce((acc, d) => {
      const type = d.organization?.type || 'UNKNOWN';
      if (!acc[type]) {
        acc[type] = { count: 0, kgWasted: 0, mealsWasted: 0 };
      }
      acc[type].count++;
      acc[type].kgWasted += d.quantityKg || 0;
      acc[type].mealsWasted += d.estimatedMeals || 0;
      return acc;
    }, {});

    sendSuccess(res, {
      summary: {
        totalExpired,
        totalKgWasted,
        totalMealsWasted,
      },
      byType: wasteByType,
      recentExpired: expired.slice(0, 20), // Last 20 expired
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { 
  listUsers, 
  verifyUser, 
  deleteUser, 
  listAllDonations, 
  getStats, 
  getPendingKYC, 
  updateKYCStatus,
  getGeoHeatmap,
  getWasteReport,
};
