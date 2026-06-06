/**
 * src/utils/jwt.util.js
 *
 * Why this file exists:
 * Centralizes all token generation and verification logic.
 * No other file imports `jsonwebtoken` or `crypto` directly —
 * they always go through this module. This makes swapping the
 * token strategy (e.g. to RS256 keys) a one-file change.
 *
 * Access token  → signed JWT,  short-lived (15 min), returned in response body
 * Refresh token → random UUID, long-lived  (7 days),  stored as SHA-256 hash in DB
 *                              sent to client as httpOnly cookie
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');

// ─── Access Token ─────────────────────────────────────────────────────────────

/**
 * Signs a new JWT access token.
 * @param {{ id: number, email: string }} payload
 * @returns {string} signed JWT
 */
const generateAccessToken = (payload) => {
  return jwt.sign(
    { sub: payload.id, email: payload.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * Verifies a JWT access token and returns the decoded payload.
 * Throws JsonWebTokenError or TokenExpiredError on failure.
 * @param {string} token
 * @returns {{ sub: number, email: string, iat: number, exp: number }}
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

// ─── Refresh Token ────────────────────────────────────────────────────────────

/**
 * Generates a cryptographically random refresh token.
 * Returns both the raw token (sent to client) and its SHA-256 hash (stored in DB).
 * @returns {{ raw: string, hash: string, expiresAt: Date }}
 */
const generateRefreshToken = () => {
  const raw = uuidv4(); // Random UUID — unpredictable, URL-safe
  const hash = hashToken(raw);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  return { raw, hash, expiresAt };
};

/**
 * Hashes a raw token string with SHA-256.
 * Used to hash a token before DB lookup or storage.
 * @param {string} raw
 * @returns {string} hex digest
 */
const hashToken = (raw) => {
  return crypto.createHash('sha256').update(raw).digest('hex');
};

// ─── Cookie Config ────────────────────────────────────────────────────────────

/**
 * Returns the standard cookie options for refresh tokens.
 * Kept here so the same options are used on set and clear.
 */
const refreshCookieOptions = () => ({
  httpOnly: true,            // Not accessible via JavaScript — prevents XSS theft
  secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
  sameSite: 'strict',        // Prevents CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  path: '/api/auth',         // Cookie only sent to /api/auth routes
});

module.exports = {
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  hashToken,
  refreshCookieOptions,
};
