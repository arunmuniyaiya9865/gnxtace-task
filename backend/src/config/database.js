/**
 * src/config/database.js
 *
 * Why this file exists:
 * Creates and exports the single Knex instance used across the entire backend.
 * All repositories import this — never create their own connections.
 * Centralizing it here means you change the DB config in ONE place.
 */

const knex = require('knex');
const env = require('./env');

const db = knex({
  client: 'mysql2',
  connection: {
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
  },
  pool: {
    min: 2,
    max: 10,
  },
  // Migrations and seeds are managed via knexfile.js (used by the CLI)
});

module.exports = db;
