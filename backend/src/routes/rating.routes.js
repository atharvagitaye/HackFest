const { Router } = require('express');
const { z } = require('zod');
const ratingController = require('../controllers/rating.controller');
const { requireAuth } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = Router();

const ratingSchema = z.object({
  donationId: z.string().uuid(),
  toUser: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  feedback: z.string().max(500).optional(),
});

/**
 * @swagger
 * tags:
 *   name: Ratings
 *   description: Post-delivery ratings and feedback
 */

/**
 * @swagger
 * /ratings:
 *   post:
 *     summary: Submit a rating for a completed donation
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [donationId, toUser, rating]
 *             properties:
 *               donationId: { type: string, format: uuid }
 *               toUser: { type: string, format: uuid }
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *               feedback: { type: string }
 *     responses:
 *       201:
 *         description: Rating submitted
 */
router.post('/', requireAuth, validate(ratingSchema), ratingController.submit);

/**
 * @swagger
 * /ratings/{donationId}:
 *   get:
 *     summary: Get ratings for a donation
 *     tags: [Ratings]
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
 *         description: List of ratings
 */
router.get('/:donationId', requireAuth, ratingController.listByDonation);

module.exports = router;
