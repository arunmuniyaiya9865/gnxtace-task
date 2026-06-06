/**
 * src/middleware/errorHandler.js
 *
 * Why this file exists:
 * Express requires a 4-argument middleware to handle errors.
 * Centralizing error handling here means controllers never need to format
 * error responses — they just call next(err).
 * This prevents inconsistent error shapes across endpoints.
 */

const { NODE_ENV } = require('../config/env');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  const response = {
    success: false,
    message,
    ...(NODE_ENV === 'development' && { stack: err.stack }),
  };

  console.error(`[Error] ${statusCode} - ${message}`);

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
