const prisma = require('../config/prisma');

const create = (data) =>
  prisma.delivery.create({
    data,
    include: { donation: true, recipient: { select: { id: true, name: true } } },
  });

const findById = (id) =>
  prisma.delivery.findUnique({
    where: { id },
    include: { donation: true, recipient: { select: { id: true, name: true } } },
  });

const findByDonation = (donationId) =>
  prisma.delivery.findFirst({ where: { donationId } });

const complete = (id, data) =>
  prisma.delivery.update({ where: { id }, data });

module.exports = { create, findById, findByDonation, complete };
