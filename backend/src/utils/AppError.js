/**
 * src/utils/AppError.js
 *
 * Why this file exists:
 * When a service needs to signal a specific HTTP error (e.g. 404 Not Found,
 * 400 Bad Request), it should throw an AppError instead of a plain Error.
 * The global errorHandler reads err.statusCode to set the response status.
 * This avoids littering res.status() calls across controllers.
 */

class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
