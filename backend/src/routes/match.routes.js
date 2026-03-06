const { Router } = require('express');
const matchController = require('../controllers/match.controller');
const { requireAuth, requireRole } = require('../middlewares/auth');
const { matchLimiter } = require('../middlewares/rateLimiter');


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
router.post('/generate/:donationId', requireAuth, requireRole(['DONOR', 'ADMIN']), matchLimiter, matchController.generate);

// Must be before /:id routes to avoid conflict
router.get('/my', requireAuth, requireRole('RECIPIENT'), matchController.getMyMatches);

/**
 * @swagger
 * /matches/{id}/accept:
 *   post:
 *     summary: Recipient accepts a match
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/accept', requireAuth, requireRole('RECIPIENT'), matchController.accept);

/**
 * @swagger
 * /matches/{id}/reject:
 *   post:
 *     summary: Recipient rejects a match
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/reject', requireAuth, requireRole('RECIPIENT'), matchController.reject);

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
