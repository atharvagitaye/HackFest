const { Router } = require('express');
const { z } = require('zod');
const deliveryController = require('../controllers/delivery.controller');
const { requireAuth, requireRole } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = Router();

const startSchema = z.object({
  donationId: z.string().uuid(),
});

const completeSchema = z.object({
  deliveryId: z.string().uuid(),
});

/**
 * @swagger
 * tags:
 *   name: Deliveries
 *   description: Delivery tracking
 */

/**
 * @swagger
 * /deliveries/start:
 *   post:
 *     summary: Start a delivery (RECIPIENT only)
 *     tags: [Deliveries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [donationId]
 *             properties:
 *               donationId: { type: string, format: uuid }
 *     responses:
 *       201:
 *         description: Delivery started
 */
router.post('/start', requireAuth, requireRole('RECIPIENT'), validate(startSchema), deliveryController.start);

/**
 * @swagger
 * /deliveries:
 *   get:
 *     summary: List deliveries for the logged-in recipient
 *     tags: [Deliveries]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of deliveries
 */
router.get('/', requireAuth, deliveryController.list);

/**
 * @swagger
 * /deliveries/{id}:
 *   get:
 *     summary: Get a specific delivery by ID
 *     tags: [Deliveries]
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
 *         description: Delivery details
 */
router.get('/:id', requireAuth, deliveryController.getById);

/**
 * @swagger
 * /deliveries/complete:
 *   post:
 *     summary: Complete a delivery
 *     tags: [Deliveries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [deliveryId]
 *             properties:
 *               deliveryId: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Delivery completed, trust score updated
 */
router.post('/complete', requireAuth, requireRole('RECIPIENT'), validate(completeSchema), deliveryController.complete);

// QR Code routes
const qrConfirmSchema = z.object({
  qrToken: z.string().min(1),
});

/**
 * @swagger
 * /deliveries/qr/confirm:
 *   post:
 *     summary: Confirm pickup via QR code scan (RECIPIENT only)
 *     tags: [Deliveries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [qrToken]
 *             properties:
 *               qrToken: { type: string }
 *     responses:
 *       200:
 *         description: Pickup confirmed via QR code
 */
router.post('/qr/confirm', requireAuth, requireRole('RECIPIENT'), validate(qrConfirmSchema), deliveryController.confirmPickupByQR);

/**
 * @swagger
 * /deliveries/qr/{token}:
 *   get:
 *     summary: Get delivery details by QR token
 *     tags: [Deliveries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Delivery details
 */
router.get('/qr/:token', requireAuth, deliveryController.getByQRToken);

module.exports = router;
