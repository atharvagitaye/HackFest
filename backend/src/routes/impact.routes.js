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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalKgSaved: { type: number }
 *                 estimatedMealsSaved: { type: integer }
 *                 estimatedCo2Reduced: { type: number }
 *                 totalSuccessfulDeliveries: { type: integer }
 */
router.get('/summary', requireAuth, impactController.summary);

module.exports = router;
