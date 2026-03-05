const { Router } = require('express');
const { z } = require('zod');
const donationController = require('../controllers/donation.controller');
const { requireAuth, requireRole } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = Router();

const createDonationSchema = z.object({
  organizationId: z.string().uuid(),
  foodCategory: z.string().max(100).optional(),
  quantityKg: z.number().positive().optional(),
  estimatedMeals: z.number().int().positive().optional(),
  preparedAt: z.string().datetime().optional(),
  expiryTime: z.string().datetime().optional(),
  pickupDeadline: z.string().datetime().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['MATCHED', 'ACCEPTED', 'PICKED_UP', 'DELIVERED', 'CANCELLED', 'EXPIRED']),
});

const addImageSchema = z.object({
  imageUrl: z.string().min(1),
});

/**
 * @swagger
 * tags:
 *   name: Donations
 *   description: Donation management
 */

/**
 * @swagger
 * /donations:
 *   post:
 *     summary: Create a new donation (DONOR only)
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [organizationId]
 *             properties:
 *               organizationId: { type: string, format: uuid }
 *               foodCategory: { type: string }
 *               quantityKg: { type: number }
 *               estimatedMeals: { type: integer }
 *               expiryTime: { type: string, format: date-time }
 *               pickupDeadline: { type: string, format: date-time }
 *               latitude: { type: number }
 *               longitude: { type: number }
 *     responses:
 *       201:
 *         description: Donation created
 */
router.post('/', requireAuth, requireRole('DONOR'), validate(createDonationSchema), donationController.create);

/**
 * @swagger
 * /donations:
 *   get:
 *     summary: List all donations
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: donorId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of donations
 */
router.get('/', requireAuth, donationController.list);

/**
 * @swagger
 * /donations/{id}:
 *   get:
 *     summary: Get donation by ID
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Donation details
 */
router.get('/:id', requireAuth, donationController.getById);

/**
 * @swagger
 * /donations/{id}/status:
 *   patch:
 *     summary: Update donation status
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [MATCHED, ACCEPTED, PICKED_UP, DELIVERED]
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch('/:id/status', requireAuth, validate(updateStatusSchema), donationController.updateStatus);

/**
 * @swagger
 * /donations/{id}/nearby-recipients:
 *   get:
 *     summary: Get nearby recipients for a donation
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of nearby recipients with distance
 */
router.get('/:id/nearby-recipients', requireAuth, donationController.nearbyRecipients);

/**
 * @swagger
 * /donations/{id}/images:
 *   post:
 *     summary: Add an image to a donation (base64 URL or remote URL)
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/images', requireAuth, validate(addImageSchema), donationController.addImage);

module.exports = router;
