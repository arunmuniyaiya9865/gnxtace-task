/**
 * Migration: create_role_permissions_table
 *
 * Purpose:
 * Pivot table that defines which permissions belong to which role.
 * This is a pure many-to-many join — no extra business columns needed here.
 * Example: the 'manager' role has permissions ['tasks:create', 'tasks:delete'].
 *
 * Key Columns:
 * - role_id      : FK → roles.id
 * - permission_id: FK → permissions.id
 *
 * Constraints:
 * - Composite unique(role_id, permission_id) — prevents duplicate assignments
 * - CASCADE DELETE on both FKs — removing a role or permission cleans this table
 *
 * Relationships:
 * - role_permissions M:1 → roles
 * - role_permissions M:1 → permissions
 */

exports.up = function (knex) {
  return knex.schema.createTable('role_permissions', (table) => {
    table.increments('id').primary();

    table
      .integer('role_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('roles')
      .onDelete('CASCADE');

    table
      .integer('permission_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('permissions')
      .onDelete('CASCADE');

    // Prevent the same permission from being assigned twice to the same role
    table.unique(['role_id', 'permission_id'], 'uq_role_permission');

    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('role_permissions');
};
