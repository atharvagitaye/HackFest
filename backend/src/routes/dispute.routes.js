const { Router } = require('express');
const { z } = require('zod');
const disputeController = require('../controllers/dispute.controller');
const validate = require('../middlewares/validate');
const { requireAuth, requireRole } = require('../middlewares/auth');

const router = Router();

const createDisputeSchema = z.object({
  deliveryId: z.string().uuid(),
  category: z.enum(['QUALITY_ISSUE', 'NO_SHOW', 'LATE_PICKUP', 'OTHER']),
  description: z.string().min(10).max(1000),
});

const resolveDisputeSchema = z.object({
  resolution: z.string().min(10).max(1000),
});

// Create dispute (donor or recipient)
router.post('/', requireAuth, validate(createDisputeSchema), disputeController.create);

// Get my disputes
router.get('/mine', requireAuth, disputeController.listMine);

// Admin: List all disputes (with filters)
router.get('/', requireAuth, requireRole('ADMIN'), disputeController.listAll);

// Get dispute by ID
router.get('/:id', requireAuth, disputeController.getById);

// Admin: Resolve dispute
router.patch('/:id/resolve', requireAuth, requireRole('ADMIN'), validate(resolveDisputeSchema), disputeController.resolve);

// Admin: Dismiss dispute
router.patch('/:id/dismiss', requireAuth, requireRole('ADMIN'), validate(resolveDisputeSchema), disputeController.dismiss);

module.exports = router;
