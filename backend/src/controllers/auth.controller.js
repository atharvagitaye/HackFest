const authService = require('../services/auth.service');
const prisma = require('../config/prisma');
const { sendSuccess } = require('../utils/response');

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    sendSuccess(res, result, 'Registration successful', 201);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    sendSuccess(res, result, 'Login successful');
  } catch (err) {
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    const { passwordHash, ...user } = req.user;
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
};

const trust = async (req, res, next) => {
  try {
    const metric = await prisma.trustMetric.findUnique({
      where: { userId: req.user.id },
    });
    // Return zeros if no metrics exist yet
    sendSuccess(res, metric ?? {
      userId: req.user.id,
      completionRate: null,
      avgRating: null,
      cancellationRate: null,
      avgResponseTimeMinutes: null,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, me, trust };
