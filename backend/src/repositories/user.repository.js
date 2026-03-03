const prisma = require('../config/prisma');

const findByEmail = (email) =>
  prisma.user.findUnique({ where: { email } });

const findById = (id) =>
  prisma.user.findUnique({ where: { id } });

const createUser = (data) =>
  prisma.user.create({ data });

module.exports = { findByEmail, findById, createUser };
