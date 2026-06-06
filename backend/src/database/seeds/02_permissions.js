/**
 * Seed: 02_permissions
 *
 * Seeds the full permission set for the platform using resource:action naming.
 * These strings are what middleware will check against (e.g. 'tasks:delete').
 *
 * Grouped by resource for readability.
 */

const permissions = [
  // ─── User management ───────────────────────────────────────────────────────
  { name: 'users:read',   description: 'View user profiles' },
  { name: 'users:create', description: 'Invite new users to the platform' },
  { name: 'users:update', description: 'Edit user profile and settings' },
  { name: 'users:delete', description: 'Deactivate or remove users' },

  // ─── Role management ───────────────────────────────────────────────────────
  { name: 'roles:read',   description: 'View roles and their permissions' },
  { name: 'roles:assign', description: 'Assign roles to users' },

  // ─── Project management ────────────────────────────────────────────────────
  { name: 'projects:read',   description: 'View projects' },
  { name: 'projects:create', description: 'Create new projects' },
  { name: 'projects:update', description: 'Edit project details and status' },
  { name: 'projects:delete', description: 'Archive or delete projects' },

  // ─── Task management ───────────────────────────────────────────────────────
  { name: 'tasks:read',   description: 'View tasks within a project' },
  { name: 'tasks:create', description: 'Create new tasks in a project' },
  { name: 'tasks:update', description: 'Edit task details and status' },
  { name: 'tasks:delete', description: 'Delete tasks from a project' },
  { name: 'tasks:assign', description: 'Assign tasks to team members' },
];

exports.seed = async function (knex) {
  await knex('permissions')
    .insert(permissions)
    .onConflict('name')
    .ignore();
};
