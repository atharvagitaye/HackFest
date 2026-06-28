const notifRepo = require('../repositories/notification.repository');

/**
 * Push a notification to a user.
 * Call this from any service after a meaningful event.
 */
const push = async (userId, type, title, description, opts = {}) => {
  try {
    return await notifRepo.create({
      userId,
      type,
      title,
      description,
      href: opts.href ?? null,
      meta: opts.meta ?? null,
      read: false,
    });
  } catch (err) {
    // Non-fatal — never let a notification failure break a business operation
    console.error('[notifications] push failed:', err.message);
    return null;
  }
};

const getForUser = (userId, opts) => notifRepo.findByUser(userId, opts);

const getUnreadCount = (userId) => notifRepo.countUnread(userId);

const markRead = (id, userId) => notifRepo.markRead(id, userId);

const markAllRead = (userId) => notifRepo.markAllRead(userId);

module.exports = { push, getForUser, getUnreadCount, markRead, markAllRead };
