/**
 * Migration: create_refresh_tokens_table
 *
 * Purpose:
 * Stores hashed refresh tokens so the server can validate, rotate,
 * and revoke them. The raw token is NEVER stored — only its SHA-256 hash.
 * This means even if the DB is compromised, the raw tokens can't be used.
 *
 * Key Columns:
 * - user_id    : FK → users.id — who this token belongs to
 * - token_hash : SHA-256 hash of the raw UUID token sent to the client
 * - expires_at : When this token is no longer valid
 * - revoked_at : Soft-revoke without deletion (audit trail)
 *
 * Relationships:
 * - refresh_tokens M:1 → users (CASCADE — tokens die with the user)
 *
 * Indexes:
 * - token_hash : Fast lookup on every /auth/refresh request
 * - user_id    : Fast "revoke all sessions for user" queries
 */

exports.up = function (knex) {
  return knex.schema.createTable('refresh_tokens', (table) => {
    table.increments('id').primary();

    table
      .integer('user_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    table.string('token_hash', 64).notNullable()
      .comment('SHA-256 hex digest of the raw refresh token — never store the raw token');

    table.timestamp('expires_at').notNullable();

    table.timestamp('revoked_at').nullable().defaultTo(null)
      .comment('Set when token is explicitly revoked (logout)');

    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Indexes
    table.index(['token_hash'], 'idx_refresh_tokens_hash');
    table.index(['user_id'], 'idx_refresh_tokens_user_id');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('refresh_tokens');
};
