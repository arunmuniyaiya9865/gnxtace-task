/**
 * src/repositories/permission.repository.js
 *
 * Why this file exists:
 * The only place that queries across user_roles → role_permissions → permissions.
 * Returns a flat array of permission name strings for a given user.
 * The authorize middleware calls this — it never writes raw Knex joins itself.
 *
 * Query logic:
 *   user_roles (user_id = ?)
 *     JOIN role_permissions ON role_permissions.role_id = user_roles.role_id
 *     JOIN permissions ON permissions.id = role_permissions.permission_id
 *   → DISTINCT permission names (user may have multiple roles with overlapping perms)
 */

const db = require('../config/database');

/**
 * Returns all permission names assigned to a user through their roles.
 * Result is deduplicated — safe even if roles share permissions.
 *
 * @param {number} userId
 * @returns {string[]} e.g. ['projects:read', 'projects:create', 'tasks:read']
 */
const getPermissionsByUserId = async (userId) => {
  const rows = await db('user_roles')
    .join('role_permissions', 'user_roles.role_id', 'role_permissions.role_id')
    .join('permissions', 'role_permissions.permission_id', 'permissions.id')
    .where('user_roles.user_id', userId)
    .distinct('permissions.name')
    .pluck('permissions.name'); // Returns string[] directly, not object[]

  return rows;
};

module.exports = { getPermissionsByUserId };
