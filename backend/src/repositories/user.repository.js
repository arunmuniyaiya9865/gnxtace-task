/**
 * src/repositories/user.repository.js
 *
 * Why this file exists:
 * The only layer that queries the `users` table.
 * Returns plain JS objects — never exposes the Knex builder outside this file.
 * Columns like `password_hash` are returned here but stripped in the service layer.
 *
 * Rules:
 * - Never throw AppError here — just return null or throw DB errors
 * - Never receive Express req/res — pure data functions only
 */

const db = require('../config/database');

const TABLE = 'users';

/**
 * Finds a user by their email address (used for login).
 * Returns the full row including password_hash — service must sanitize.
 * @param {string} email
 * @returns {object|undefined}
 */
const findByEmail = (email) => {
  return db(TABLE)
    .where({ email })
    .whereNull('deleted_at')
    .first();
};

/**
 * Finds a user by their primary key.
 * Joins user_roles → roles to return role names in one query.
 * @param {number} id
 * @returns {object|undefined}
 */
const findById = (id) => {
  return db(TABLE)
    .where(`${TABLE}.id`, id)
    .whereNull(`${TABLE}.deleted_at`)
    .first();
};

/**
 * Returns a user with their assigned role names.
 * Used in GET /auth/me to enrich the response.
 * @param {number} id
 * @returns {object|undefined} user + roles array
 */
const findByIdWithRoles = async (id) => {
  const user = await db(TABLE)
    .where(`${TABLE}.id`, id)
    .whereNull(`${TABLE}.deleted_at`)
    .first();

  if (!user) return null;

  const roles = await db('user_roles')
    .join('roles', 'user_roles.role_id', 'roles.id')
    .where('user_roles.user_id', id)
    .pluck('roles.name'); // Returns array of role name strings

  return { ...user, roles };
};

/**
 * Updates last_login_at to the current timestamp.
 * Called on every successful login.
 * @param {number} id
 * @returns {number} number of rows updated
 */
const updateLastLogin = (id) => {
  return db(TABLE)
    .where({ id })
    .update({ last_login_at: db.fn.now() });
};

module.exports = {
  findByEmail,
  findById,
  findByIdWithRoles,
  updateLastLogin,
};
