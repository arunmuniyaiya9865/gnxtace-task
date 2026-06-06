/**
 * Seed: 04_demo_users
 *
 * Creates one demo user for each role for local development and testing.
 * IMPORTANT: These are development-only passwords (bcrypt hash of 'Password@123').
 * Never run this seed in production.
 *
 * Demo accounts:
 *   admin@gnxtace.com   → admin role
 *   manager@gnxtace.com → manager role
 *   member@gnxtace.com  → member role
 *
 * The bcrypt hash below was generated with saltRounds=10 for 'Password@123'.
 * Replace with real hashes or use a bcrypt library in a real seed if needed.
 */

// bcrypt hash of 'Password@123' (rounds=10) — pre-computed to avoid bcrypt dependency in seed
const DEMO_PASSWORD_HASH =
  '$2b$10$Y5tz3U2L1J9u/CWMkfrxMObheZFEaB1sGqnp2JiH8t.qxXvXTelZG';

exports.seed = async function (knex) {
  // ── Insert demo users ───────────────────────────────────────────────────────
  await knex('users')
    .insert([
      { name: 'Admin User',   email: 'admin@gnxtace.com',   password_hash: DEMO_PASSWORD_HASH },
      { name: 'Demo Manager', email: 'manager@gnxtace.com', password_hash: DEMO_PASSWORD_HASH },
      { name: 'Demo Member',  email: 'member@gnxtace.com',  password_hash: DEMO_PASSWORD_HASH },
    ])
    .onConflict('email')
    .ignore();

  // ── Fetch IDs dynamically ───────────────────────────────────────────────────
  const users = await knex('users')
    .whereIn('email', ['admin@gnxtace.com', 'manager@gnxtace.com', 'member@gnxtace.com'])
    .select('id', 'email');

  const roles = await knex('roles')
    .whereIn('name', ['admin', 'manager', 'member'])
    .select('id', 'name');

  const userMap = Object.fromEntries(users.map((u) => [u.email, u.id]));
  const roleMap = Object.fromEntries(roles.map((r) => [r.name, r.id]));

  // ── Assign roles ────────────────────────────────────────────────────────────
  await knex('user_roles')
    .insert([
      { user_id: userMap['admin@gnxtace.com'],   role_id: roleMap['admin'] },
      { user_id: userMap['manager@gnxtace.com'], role_id: roleMap['manager'] },
      { user_id: userMap['member@gnxtace.com'],  role_id: roleMap['member'] },
    ])
    .onConflict(['user_id', 'role_id'])
    .ignore();
};
