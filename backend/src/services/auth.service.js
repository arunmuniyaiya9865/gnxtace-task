/**
 * src/services/auth.service.js
 *
 * Why this file exists:
 * Contains all authentication business logic.
 * This is the only layer that uses bcrypt, calls repositories,
 * and decides what constitutes a valid login.
 *
 * Rules:
 * - Never import Express req/res here
 * - Throw AppError for domain failures — controller catches them via asyncHandler
 * - Return plain sanitized objects — never expose password_hash upstream
 */

const bcrypt = require('bcryptjs');
const AppError = require('../utils/AppError');
const { generateAccessToken, generateRefreshToken, hashToken } = require('../utils/jwt.util');
const userRepo = require('../repositories/user.repository');
const refreshTokenRepo = require('../repositories/refreshToken.repository');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Strips sensitive fields from a user row before returning to the client.
 * @param {object} user raw DB row
 * @returns {object} sanitized user
 */
const sanitizeUser = ({ password_hash, deleted_at, ...safe }) => safe;

// ─── Service Methods ──────────────────────────────────────────────────────────

/**
 * Validates credentials, returns access token + refresh token.
 * Also updates last_login_at and cleans up stale tokens.
 *
 * @param {string} email
 * @param {string} password  plain-text password from request
 * @returns {{ accessToken: string, refreshToken: string, user: object }}
 */
const login = async (email, password) => {
  // 1. Find user — generic error message prevents user enumeration
  const user = await userRepo.findByEmail(email);
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // 2. Check account is active
  if (!user.is_active) {
    throw new AppError('Account is disabled. Contact your administrator.', 403);
  }

  // 3. Compare password against bcrypt hash
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // 4. Generate tokens
  const accessToken = generateAccessToken({ id: user.id, email: user.email });
  const { raw: refreshToken, hash: tokenHash, expiresAt } = generateRefreshToken();

  // 5. Persist refresh token (hashed) + cleanup old stale tokens
  await Promise.all([
    refreshTokenRepo.create({ userId: user.id, tokenHash, expiresAt }),
    refreshTokenRepo.cleanupForUser(user.id),
    userRepo.updateLastLogin(user.id),
  ]);

  return {
    accessToken,
    refreshToken, // raw — controller puts this in httpOnly cookie
    user: sanitizeUser(user),
  };
};

/**
 * Validates a refresh token and issues a new access token.
 * Rotates the refresh token (old one revoked, new one issued).
 *
 * @param {string} rawRefreshToken  raw token from httpOnly cookie
 * @returns {{ accessToken: string, refreshToken: string }}
 */
const refresh = async (rawRefreshToken) => {
  if (!rawRefreshToken) {
    throw new AppError('Refresh token missing', 401);
  }

  const tokenHash = hashToken(rawRefreshToken);

  // 1. Look up hashed token in DB (also checks expiry + revoked_at)
  const stored = await refreshTokenRepo.findByHash(tokenHash);
  if (!stored) {
    throw new AppError('Refresh token invalid or expired', 401);
  }

  // 2. Fetch the user who owns this token
  const user = await userRepo.findById(stored.user_id);
  if (!user || !user.is_active) {
    throw new AppError('User not found or disabled', 401);
  }

  // 3. Rotate — revoke old token, generate new pair
  const { raw: newRefreshToken, hash: newHash, expiresAt } = generateRefreshToken();
  const newAccessToken = generateAccessToken({ id: user.id, email: user.email });

  await Promise.all([
    refreshTokenRepo.revokeByHash(tokenHash),
    refreshTokenRepo.create({ userId: user.id, tokenHash: newHash, expiresAt }),
  ]);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

/**
 * Revokes the provided refresh token (single-device logout).
 * @param {string} rawRefreshToken
 */
const logout = async (rawRefreshToken) => {
  if (!rawRefreshToken) return; // Already logged out — no error needed

  const tokenHash = hashToken(rawRefreshToken);
  await refreshTokenRepo.revokeByHash(tokenHash);
};

/**
 * Returns the currently authenticated user with their roles.
 * @param {number} userId  from JWT payload (req.user.id)
 * @returns {object} sanitized user + roles array
 */
const getMe = async (userId) => {
  const user = await userRepo.findByIdWithRoles(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return sanitizeUser(user);
};

module.exports = { login, refresh, logout, getMe };
