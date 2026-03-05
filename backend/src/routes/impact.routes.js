const { Router } = require('express');
const impactController = require('../controllers/impact.controller');
const { requireAuth } = require('../middlewares/auth');

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Impact
 *   description: Social impact dashboard metrics
 */

/**
 * @swagger
 * /impact/summary:
 *   get:
 *     summary: Get platform-wide impact summary
 *     tags: [Impact]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Impact summary
 */
router.get('/summary', requireAuth, impactController.summary);

/**
 * @swagger
 * /impact/daily:
 *   get:
 *     summary: Get daily impact records for trend chart
 *     tags: [Impact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *         description: Number of past days to return (default 30)
 *     responses:
 *       200:
 *         description: Array of daily impact data points
 */
router.get('/daily', requireAuth, impactController.daily);

module.exports = router;
