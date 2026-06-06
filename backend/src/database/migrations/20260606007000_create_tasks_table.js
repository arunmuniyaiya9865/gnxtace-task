/**
 * Migration: create_tasks_table
 *
 * Purpose:
 * Tasks are the atomic unit of work inside a project. Each task belongs to
 * exactly one project and optionally has one assignee. The reporter is the
 * user who created the task — these two can be different people.
 *
 * Key Columns:
 * - title       : Short summary of the work item
 * - description : Optional detail / acceptance criteria
 * - status      : Workflow state — 'todo' | 'in_progress' | 'done' | 'cancelled'
 * - priority    : Urgency — 'low' | 'medium' | 'high'
 * - project_id  : FK → projects.id (CASCADE — tasks die with the project)
 * - assignee_id : FK → users.id (nullable — task can be unassigned)
 *                 SET NULL on delete — if user is deleted, task becomes unassigned
 * - reporter_id : FK → users.id — who created the task
 *                 RESTRICT on delete — can't delete a user who has reported tasks
 * - due_date    : Optional deadline
 *
 * Relationships:
 * - tasks M:1 → projects  (project_id, CASCADE)
 * - tasks M:1 → users     (assignee_id, SET NULL)
 * - tasks M:1 → users     (reporter_id, RESTRICT)
 *
 * Indexes:
 * - project_id  : "All tasks in this project" — most common query
 * - assignee_id : "Tasks assigned to me" — dashboard query
 * - status      : Filter by kanban column
 * - priority    : Sort / filter by urgency
 */

exports.up = function (knex) {
  return knex.schema.createTable('tasks', (table) => {
    table.increments('id').primary();

    table.string('title', 200).notNullable();

    table.text('description').nullable();

    table
      .enum('status', ['todo', 'in_progress', 'done', 'cancelled'])
      .notNullable()
      .defaultTo('todo');

    table
      .enum('priority', ['low', 'medium', 'high'])
      .notNullable()
      .defaultTo('medium');

    // ── Foreign Keys ────────────────────────────────────────────────────────

    table
      .integer('project_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('projects')
      .onDelete('CASCADE') // Delete all tasks when a project is hard-deleted
      .comment('Project this task belongs to');

    table
      .integer('assignee_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('users')
      .onDelete('SET NULL') // Unassign task if assignee account is deleted
      .comment('User responsible for completing this task');

    table
      .integer('reporter_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('RESTRICT') // Cannot delete a user who has reported tasks
      .comment('User who created this task');

    table.date('due_date').nullable();

    table.timestamps(true, true);

    // ── Indexes ─────────────────────────────────────────────────────────────
    table.index(['project_id'], 'idx_tasks_project_id');
    table.index(['assignee_id'], 'idx_tasks_assignee_id');
    table.index(['status'], 'idx_tasks_status');
    table.index(['priority'], 'idx_tasks_priority');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('tasks');
};
