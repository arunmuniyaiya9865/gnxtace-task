/**
 * Migration: create_user_roles_table
 *
 * Purpose:
 * Pivot table that assigns one or more roles to a user.
 * A user can be both a 'manager' on one project and a 'member' elsewhere —
 * to support that in the future this table can gain a project_id column.
 * For now it is kept global (platform-wide roles).
 *
 * Key Columns:
 * - user_id: FK → users.id
 * - role_id: FK → roles.id
 *
 * Constraints:
 * - Composite unique(user_id, role_id) — a user can't hold the same role twice
 * - CASCADE DELETE on both FKs — clean up when user or role is removed
 *
 * Relationships:
 * - user_roles M:1 → users
 * - user_roles M:1 → roles
 */

exports.up = function (knex) {
  return knex.schema.createTable('user_roles', (table) => {
    table.increments('id').primary();

    table
      .integer('user_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    table
      .integer('role_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('roles')
      .onDelete('CASCADE');

    table.unique(['user_id', 'role_id'], 'uq_user_role');

    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('user_roles');
};
