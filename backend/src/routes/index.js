const { Router } = require('express');
const authRoutes = require('./auth.routes');
const donationRoutes = require('./donation.routes');
const matchRoutes = require('./match.routes');
const deliveryRoutes = require('./delivery.routes');
const impactRoutes = require('./impact.routes');
const ratingRoutes = require('./rating.routes');
const adminRoutes = require('./admin.routes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/donations', donationRoutes);
router.use('/matches', matchRoutes);
router.use('/deliveries', deliveryRoutes);
router.use('/impact', impactRoutes);
router.use('/ratings', ratingRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
