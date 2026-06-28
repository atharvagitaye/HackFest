const prisma = require('../config/prisma');

const create = (data) =>
  prisma.notification.create({ data });

const findByUser = (userId, { unreadOnly = false, limit = 50 } = {}) =>
  prisma.notification.findMany({
    where: { userId, ...(unreadOnly ? { read: false } : {}) },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

const countUnread = (userId) =>
  prisma.notification.count({ where: { userId, read: false } });

const markRead = (id, userId) =>
  prisma.notification.updateMany({
    where: { id, userId },
    data: { read: true },
  });

const markAllRead = (userId) =>
  prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });

module.exports = { create, findByUser, countUnread, markRead, markAllRead };
