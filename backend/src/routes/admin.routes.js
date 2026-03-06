const { Router } = require('express');
const { z } = require('zod');
const adminController = require('../controllers/admin.controller');
const { requireAuth, requireRole } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = Router();

// All admin routes require ADMIN role
router.use(requireAuth, requireRole('ADMIN'));

const verifySchema = z.object({ verified: z.boolean() });
const kycSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  notes: z.string().optional(),
});

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only platform management
 */

router.get('/stats', adminController.getStats);
router.get('/users', adminController.listUsers);
router.patch('/users/:id/verify', validate(verifySchema), adminController.verifyUser);
router.delete('/users/:id', adminController.deleteUser);
router.get('/donations', adminController.listAllDonations);
router.get('/kyc/pending', adminController.getPendingKYC);
router.patch('/kyc/:id', validate(kycSchema), adminController.updateKYCStatus);

module.exports = router;
