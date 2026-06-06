/**
 * Migration: create_roles_table
 *
 * Purpose:
 * Roles group a set of permissions together under a named label
 * (e.g. 'admin', 'manager', 'member'). A user can hold one or more roles.
 * Roles are the axis of access control — permissions are attached to roles,
 * not directly to users, which keeps RBAC manageable as the team grows.
 *
 * Key Columns:
 * - name       : Unique slug used in code checks (e.g. role === 'admin')
 * - description: Human-readable label shown in the UI
 *
 * Relationships:
 * - roles → role_permissions (1:M)
 * - roles → user_roles       (1:M)
 */

exports.up = function (knex) {
  return knex.schema.createTable('roles', (table) => {
    table.increments('id').primary();

    table.string('name', 50).notNullable().unique()
      .comment('Unique slug: admin | manager | member');

    table.string('description', 255).nullable()
      .comment('Human-readable label for the UI');

    table.timestamps(true, true); // created_at, updated_at (auto-managed by MySQL)
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('roles');
};
