/**
 * Seed: 03_role_permissions
 *
 * Assigns the correct permissions to each default role.
 *
 * admin   → all permissions
 * manager → projects + tasks (no user/role management)
 * member  → read projects, read/update tasks only
 *
 * Strategy:
 * Fetches role and permission IDs dynamically from the DB so this seed
 * does not hardcode any auto-increment IDs — safe across all environments.
 */

exports.seed = async function (knex) {
  // ── Fetch IDs from DB (never hardcode auto-increment IDs) ──────────────────
  const roles = await knex('roles').select('id', 'name');
  const permissions = await knex('permissions').select('id', 'name');

  const roleMap = Object.fromEntries(roles.map((r) => [r.name, r.id]));
  const permMap = Object.fromEntries(permissions.map((p) => [p.name, p.id]));

  // ── Role → Permission mapping ───────────────────────────────────────────────
  const assignments = {
    admin: [
      'users:read', 'users:create', 'users:update', 'users:delete',
      'roles:read', 'roles:assign',
      'projects:read', 'projects:create', 'projects:update', 'projects:delete',
      'tasks:read', 'tasks:create', 'tasks:update', 'tasks:delete', 'tasks:assign',
    ],
    manager: [
      'projects:read', 'projects:create', 'projects:update', 'projects:delete',
      'tasks:read', 'tasks:create', 'tasks:update', 'tasks:delete', 'tasks:assign',
    ],
    member: [
      'projects:read',
      'tasks:read', 'tasks:update',
    ],
  };

  // ── Build rows and insert ───────────────────────────────────────────────────
  const rows = [];
  for (const [roleName, permNames] of Object.entries(assignments)) {
    for (const permName of permNames) {
      rows.push({
        role_id: roleMap[roleName],
        permission_id: permMap[permName],
      });
    }
  }

  await knex('role_permissions')
    .insert(rows)
    .onConflict(['role_id', 'permission_id'])
    .ignore();
};
