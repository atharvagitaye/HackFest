const { ZodError } = require('zod');
const AppError = require('../utils/AppError');
const { sendError } = require('../utils/response');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Zod validation errors
  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return sendError(res, 'Validation failed', 422, errors);
  }

  // Operational errors (AppError)
  if (err instanceof AppError && err.isOperational) {
    return sendError(res, err.message, err.statusCode);
  }

  // Prisma unique constraint
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    return sendError(res, `${field} already exists`, 409);
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return sendError(res, 'Record not found', 404);
  }

  // Unknown errors — don't leak internals
  console.error('Unhandled error:', err);
  return sendError(res, 'Internal server error', 500);
};

module.exports = errorHandler;
