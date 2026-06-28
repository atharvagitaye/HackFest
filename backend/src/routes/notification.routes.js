const { Router } = require('express');
const { requireAuth } = require('../middlewares/auth');
const ctrl = require('../controllers/notification.controller');

const router = Router();

router.get('/', requireAuth, ctrl.list);
router.get('/unread-count', requireAuth, ctrl.unreadCount);
// /read-all must be before /:id/read or Express matches 'read-all' as an id
router.patch('/read-all', requireAuth, ctrl.markAllRead);
router.patch('/:id/read', requireAuth, ctrl.markRead);

module.exports = router;
