const donationService = require('../services/donation.service');
const { sendSuccess } = require('../utils/response');

const create = async (req, res, next) => {
  try {
    // If client didn't supply organizationId, fall back to the donor's own org
    const organizationId = req.body.organizationId || req.user.organizationId || null;
    const donation = await donationService.createDonation(req.user.id, {
      ...req.body,
      organizationId,
    });
    sendSuccess(res, donation, 'Donation created', 201);
  } catch (err) {
    next(err);
  }
};

const list = async (req, res, next) => {
  try {
    const donations = await donationService.listDonations(req.query);
    sendSuccess(res, donations);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const donation = await donationService.getDonation(req.params.id);
    sendSuccess(res, donation);
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const donation = await donationService.updateDonationStatus(
      req.params.id,
      req.body.status,
      req.user.id,
      req.user.role
    );
    sendSuccess(res, donation, 'Status updated');
  } catch (err) {
    next(err);
  }
};

const nearbyRecipients = async (req, res, next) => {
  try {
    const recipients = await donationService.getNearbyRecipients(req.params.id);
    sendSuccess(res, recipients);
  } catch (err) {
    next(err);
  }
};

const addImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Support both multer file upload and legacy JSON imageUrl
    const imageUrl = req.file
      ? `/uploads/${req.file.filename}`
      : req.body?.imageUrl;
    if (!imageUrl) return next(require('../utils/AppError').badRequest('No image provided'));
    const image = await donationService.addImage(id, imageUrl);
    sendSuccess(res, image, 'Image added', 201);
  } catch (err) {
    next(err);
  }
};

const getStatusLogs = async (req, res, next) => {
  try {
    const logs = await donationService.getStatusLogs(req.params.id);
    sendSuccess(res, logs);
  } catch (err) {
    next(err);
  }
};

const exportCSV = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    
    // Get donations based on role
    const donations = role === 'DONOR'
      ? await donationService.listDonations({ donorId: userId })
      : await donationService.listDonations({ recipientId: userId });

    // Create CSV header
    const headers = [
      'Date',
      'Food Category',
      'Quantity (kg)',
      'Estimated Meals',
      'Status',
      'Organization',
      'Pickup Location',
      'Expiry Time',
    ];

    // Create CSV rows
    const rows = donations.map((d) => [
      new Date(d.createdAt).toLocaleDateString('en-IN'),
      d.foodCategory || 'N/A',
      d.quantityKg || '0',
      d.estimatedMeals || '0',
      d.status,
      d.organization?.name || 'N/A',
      d.organization?.address || 'N/A',
      d.expiryTime ? new Date(d.expiryTime).toLocaleString('en-IN') : 'N/A',
    ]);

    // Combine headers and rows
    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    // Set response headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="donations_${Date.now()}.csv"`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
};

module.exports = { create, list, getById, updateStatus, nearbyRecipients, addImage, getStatusLogs, exportCSV };
