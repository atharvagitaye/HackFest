const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const userRepo = require('../repositories/user.repository');
const AppError = require('../utils/AppError');

const SALT_ROUNDS = 12;

const register = async ({ name, email, password, role, phone, organizationId }) => {
  const existing = await userRepo.findByEmail(email);
  if (existing) {
    throw AppError.conflict('Email already in use', 'EMAIL_TAKEN');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await userRepo.createUser({
    name,
    email,
    passwordHash,
    role,
    phone,
    ...(organizationId && { organizationId }),
  });

  const token = signToken(user.id);
  return { user: sanitize(user), token };
};

const login = async ({ email, password }) => {
  const user = await userRepo.findByEmail(email);
  if (!user) {
    throw AppError.unauthorized('Invalid email or password');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw AppError.unauthorized('Invalid email or password');
  }

  const token = signToken(user.id);
  return { user: sanitize(user), token };
};

const signToken = (userId) =>
  jwt.sign({ userId }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

const sanitize = (user) => {
  const { passwordHash, ...rest } = user;
  return rest;
};

module.exports = { register, login };
