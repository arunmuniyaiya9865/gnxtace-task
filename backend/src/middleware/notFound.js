/**
 * src/middleware/notFound.js
 *
 * Why this file exists:
 * Without this, Express returns an HTML 404 page for unknown routes.
 * This middleware converts those into consistent JSON 404 responses,
 * which is what API clients expect.
 */

const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = notFound;
