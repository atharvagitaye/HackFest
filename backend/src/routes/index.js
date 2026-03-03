const { Router } = require('express');
const authRoutes = require('./auth.routes');
const donationRoutes = require('./donation.routes');
const matchRoutes = require('./match.routes');
const deliveryRoutes = require('./delivery.routes');
const impactRoutes = require('./impact.routes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/donations', donationRoutes);
router.use('/matches', matchRoutes);
router.use('/deliveries', deliveryRoutes);
router.use('/impact', impactRoutes);

module.exports = router;
