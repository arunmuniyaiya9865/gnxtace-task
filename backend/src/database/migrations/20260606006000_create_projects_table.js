/**
 * Migration: create_projects_table
 *
 * Purpose:
 * A project is the top-level container for tasks. Every task must belong to
 * a project. Projects have a single owner (the user who created it) but team
 * membership can be extended later via a project_members pivot table.
 *
 * Key Columns:
 * - name       : Display name of the project
 * - description: Optional rich-text summary
 * - status     : Lifecycle state — 'active' | 'on_hold' | 'archived'
 * - owner_id   : FK → users.id — the user who owns/created the project
 * - due_date   : Optional target completion date (no time component needed)
 * - deleted_at : Soft delete — archived projects are hidden, not deleted
 *
 * Relationships:
 * - projects M:1 → users  (owner_id)
 * - projects 1:M → tasks
 *
 * Indexes:
 * - owner_id   : Fast lookup of "my projects"
 * - status     : Filter by active/archived projects efficiently
 * - deleted_at : Exclude soft-deleted rows in list queries
 */

exports.up = function (knex) {
  return knex.schema.createTable('projects', (table) => {
    table.increments('id').primary();

    table.string('name', 150).notNullable();

    table.text('description').nullable();

    table
      .enum('status', ['active', 'on_hold', 'archived'])
      .notNullable()
      .defaultTo('active');

    table
      .integer('owner_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('RESTRICT') // Don't delete a project when its owner is deleted
      .comment('User who owns this project');

    table.date('due_date').nullable();

    table.timestamp('deleted_at').nullable().defaultTo(null);

    table.timestamps(true, true);

    // Indexes
    table.index(['owner_id'], 'idx_projects_owner_id');
    table.index(['status'], 'idx_projects_status');
    table.index(['deleted_at'], 'idx_projects_deleted_at');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('projects');
};
