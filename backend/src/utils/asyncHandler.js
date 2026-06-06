/**
 * src/utils/asyncHandler.js
 *
 * Why this file exists:
 * Express does not catch errors thrown from async route handlers by default.
 * Without this wrapper, an `await someService()` that throws will silently
 * crash the request. asyncHandler wraps any async controller function and
 * forwards thrown errors to next(), which routes them to the errorHandler.
 *
 * Usage:
 *   router.get('/resource', asyncHandler(async (req, res) => { ... }));
 */

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
