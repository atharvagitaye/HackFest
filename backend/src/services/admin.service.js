const userRepo = require('../repositories/user.repository');
const AppError = require('../utils/AppError');

const getPendingVerifications = () => userRepo.getPendingVerifications();

const verifyUser = async (userId, status, notes) => {
  if (!['APPROVED', 'REJECTED'].includes(status)) {
    throw AppError.badRequest('Invalid verification status');
  }
  
  const user = await userRepo.findById(userId);
  if (!user) {
    throw AppError.notFound('User not found');
  }

  return userRepo.updateVerificationStatus(userId, status, notes);
};

module.exports = { getPendingVerifications, verifyUser };
