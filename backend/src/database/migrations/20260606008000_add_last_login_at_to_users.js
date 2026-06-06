/**
 * Migration: add_last_login_at_to_users
 *
 * Adds last_login_at to the existing users table.
 * This is kept as a separate migration (not in the original users migration)
 * because it is an auth concern, not a user identity concern.
 * Separation makes rollback granular — you can undo auth changes
 * without touching the core users schema.
 */

exports.up = function (knex) {
  return knex.schema.alterTable('users', (table) => {
    table
      .timestamp('last_login_at')
      .nullable()
      .defaultTo(null)
      .after('is_active')
      .comment('Updated on every successful login');
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('users', (table) => {
    table.dropColumn('last_login_at');
  });
};
