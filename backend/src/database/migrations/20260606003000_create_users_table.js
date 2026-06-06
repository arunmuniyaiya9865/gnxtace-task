/**
 * Migration: create_users_table
 *
 * Purpose:
 * The central identity table. Stores credentials and profile information.
 * Users are linked to roles via the user_roles pivot table — this file does NOT
 * include role columns directly (no role_id here) because a user can have
 * multiple roles.
 *
 * Key Columns:
 * - email        : Login identifier, must be globally unique
 * - password_hash: Bcrypt hash — never store plain text passwords
 * - is_active    : Soft-disable an account without deleting it
 * - deleted_at   : Soft-delete support — null means active record
 *
 * Relationships:
 * - users → user_roles   (1:M)  → roles they hold
 * - users → projects     (1:M)  → projects they own
 * - users → tasks        (1:M)  → tasks they are assigned to or reported
 *
 * Indexes:
 * - email is unique (enforced by DB, used for fast login lookup)
 * - deleted_at to filter soft-deleted records efficiently
 */

exports.up = function (knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();

    table.string('name', 100).notNullable();

    table.string('email', 150).notNullable().unique();

    table.string('password_hash', 255).notNullable();

    table.boolean('is_active').notNullable().defaultTo(true)
      .comment('false = account disabled without deletion');

    table.timestamp('deleted_at').nullable().defaultTo(null)
      .comment('Soft delete — null means not deleted');

    table.timestamps(true, true);

    // Partial-style index for active users only (commonly queried)
    table.index(['deleted_at'], 'idx_users_deleted_at');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('users');
};
