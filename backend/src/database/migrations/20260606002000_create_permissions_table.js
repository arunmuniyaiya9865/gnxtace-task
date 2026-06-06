/**
 * Migration: create_permissions_table
 *
 * Purpose:
 * Permissions are fine-grained action strings that guard specific operations.
 * They follow a resource:action naming convention (e.g. 'projects:create',
 * 'tasks:delete'). Permissions are assigned to roles — not directly to users.
 *
 * Key Columns:
 * - name       : Unique action string checked in middleware (e.g. 'projects:read')
 * - description: Explains what the permission allows
 *
 * Relationships:
 * - permissions → role_permissions (1:M)
 */

exports.up = function (knex) {
  return knex.schema.createTable('permissions', (table) => {
    table.increments('id').primary();

    table.string('name', 100).notNullable().unique()
      .comment('Action string: resource:action (e.g. projects:create)');

    table.string('description', 255).nullable();

    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('permissions');
};
