const { Router } = require('express');
const matchController = require('../controllers/match.controller');
const { requireAuth, requireRole } = require('../middlewares/auth');

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Matches
 *   description: AI-powered donation matching
 */

/**
 * @swagger
 * /matches/generate/{donationId}:
 *   post:
 *     summary: Generate matches for a donation
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: donationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Matches generated successfully
 */
router.post('/generate/:donationId', requireAuth, requireRole(['DONOR', 'ADMIN']), matchController.generate);

/**
 * @swagger
 * /matches/{donationId}:
 *   get:
 *     summary: Get all matches for a donation
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: donationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of matches
 */
router.get('/:donationId', requireAuth, matchController.listByDonation);

module.exports = router;
