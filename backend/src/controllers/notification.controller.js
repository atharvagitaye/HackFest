const notifService = require('../services/notification.service');
const { sendSuccess } = require('../utils/response');

const list = async (req, res, next) => {
  try {
    const unreadOnly = req.query.unread === 'true';
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const notifications = await notifService.getForUser(req.user.id, { unreadOnly, limit });
    sendSuccess(res, notifications);
  } catch (err) { next(err); }
};

const unreadCount = async (req, res, next) => {
  try {
    const count = await notifService.getUnreadCount(req.user.id);
    sendSuccess(res, { count });
  } catch (err) { next(err); }
};

const markRead = async (req, res, next) => {
  try {
    await notifService.markRead(req.params.id, req.user.id);
    sendSuccess(res, null, 'Marked as read');
  } catch (err) { next(err); }
};

const markAllRead = async (req, res, next) => {
  try {
    await notifService.markAllRead(req.user.id);
    sendSuccess(res, null, 'All marked as read');
  } catch (err) { next(err); }
};

module.exports = { list, unreadCount, markRead, markAllRead };
