const authService = require('../services/auth.service');
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

module.exports = { register, login, me };
