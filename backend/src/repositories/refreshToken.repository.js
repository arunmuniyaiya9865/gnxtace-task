/**
 * src/repositories/refreshToken.repository.js
 *
 * Why this file exists:
 * All DB operations on the `refresh_tokens` table live here.
 * The raw token is NEVER passed to this layer — only its hash.
 * The service layer does the hashing before calling these functions.
 */

const db = require('../config/database');

const TABLE = 'refresh_tokens';

/**
 * Inserts a new hashed refresh token for a user.
 * @param {{ userId: number, tokenHash: string, expiresAt: Date }} params
 * @returns {number[]} inserted ID
 */
const create = ({ userId, tokenHash, expiresAt }) => {
  return db(TABLE).insert({
    user_id: userId,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });
};

/**
 * Finds a refresh token row by its hash.
 * Returns null if not found, expired, or already revoked.
 * @param {string} tokenHash
 * @returns {object|undefined}
 */
const findByHash = (tokenHash) => {
  return db(TABLE)
    .where({ token_hash: tokenHash })
    .whereNull('revoked_at')
    .where('expires_at', '>', db.fn.now())
    .first();
};

/**
 * Revokes a specific refresh token by its hash (logout).
 * Sets revoked_at instead of deleting — preserves audit trail.
 * @param {string} tokenHash
 * @returns {number} rows updated
 */
const revokeByHash = (tokenHash) => {
  return db(TABLE)
    .where({ token_hash: tokenHash })
    .update({ revoked_at: db.fn.now() });
};

/**
 * Revokes ALL refresh tokens for a user (force logout all sessions).
 * Useful for password changes and account suspension.
 * @param {number} userId
 * @returns {number} rows updated
 */
const revokeAllByUserId = (userId) => {
  return db(TABLE)
    .where({ user_id: userId })
    .whereNull('revoked_at')
    .update({ revoked_at: db.fn.now() });
};

/**
 * Deletes expired or revoked tokens for a user.
 * Called as lightweight cleanup during login — keeps the table lean.
 * @param {number} userId
 */
const cleanupForUser = (userId) => {
  return db(TABLE)
    .where({ user_id: userId })
    .where(function () {
      this.where('expires_at', '<', db.fn.now()).orWhereNotNull('revoked_at');
    })
    .delete();
};

module.exports = {
  create,
  findByHash,
  revokeByHash,
  revokeAllByUserId,
  cleanupForUser,
};
