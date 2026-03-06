const { Router } = require('express');
const { z } = require('zod');
const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate');
const { requireAuth } = require('../middlewares/auth');


const router = Router();

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['DONOR', 'RECIPIENT', 'ADMIN']),
  phone: z.string().max(20).optional(),
  organizationId: z.string().uuid().optional(),
  panNumber: z.string().max(20).optional(),
  panDocumentUrl: z.string().url().optional().or(z.literal('')),
  fssaiLicense: z.string().max(50).optional(),
  fssaiDocumentUrl: z.string().url().optional().or(z.literal('')),
  address: z.string().max(300).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  maxCapacityKg: z.number().positive().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               role: { type: string, enum: [DONOR, RECIPIENT, ADMIN] }
 *               phone: { type: string }
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user
 */
router.get('/me', requireAuth, authController.me);

/**
 * @swagger
 * /auth/trust:
 *   get:
 *     summary: Get trust metrics for the current user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trust metric record
 */
router.get('/trust', requireAuth, authController.trust);

module.exports = router;
