/**
 * Seed: 01_roles
 *
 * Seeds the three baseline roles every project management platform needs.
 * Run: npm run seed
 *
 * Strategy: Use INSERT IGNORE (via onConflict ignore) so re-running seeds
 * never creates duplicates — idempotent by design.
 */

exports.seed = async function (knex) {
  await knex('roles')
    .insert([
      {
        name: 'admin',
        description: 'Full platform access — manage users, roles, all projects',
      },
      {
        name: 'manager',
        description: 'Can create and manage projects and tasks within them',
      },
      {
        name: 'member',
        description: 'Can view and update tasks assigned to them',
      },
    ])
    .onConflict('name')
    .ignore(); // Safe to re-run
};
