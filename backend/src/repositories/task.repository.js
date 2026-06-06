/**
 * src/repositories/task.repository.js
 *
 * Why this file exists:
 * The only layer that runs Knex queries against the `tasks` table.
 * Returns plain JS objects — never exposes Knex builders outside this file.
 *
 * Key join strategy:
 * Every read query joins `projects` and filters projects.deleted_at IS NULL.
 * This ensures tasks belonging to archived projects are never returned.
 * The assignee join is a LEFT JOIN (assignee_id is nullable).
 * The reporter join is an INNER JOIN (reporter_id is always set).
 *
 * Rules:
 * - Never throw AppError here — return null/undefined for missing rows
 * - Never receive Express req/res — pure data functions only
 * - No hard-delete method — tasks follow their project's lifecycle
 */

const db = require('../config/database');

const TABLE = 'tasks';

// ─── Column Select List ───────────────────────────────────────────────────────
// Defined once, reused in both findAll and findById to stay DRY.
const TASK_COLUMNS = [
  `${TABLE}.id`,
  `${TABLE}.title`,
  `${TABLE}.description`,
  `${TABLE}.status`,
  `${TABLE}.priority`,
  `${TABLE}.project_id`,
  `${TABLE}.assignee_id`,
  `${TABLE}.reporter_id`,
  `${TABLE}.due_date`,
  `${TABLE}.created_at`,
  `${TABLE}.updated_at`,
  'projects.name as project_name',
  'assignee.name as assignee_name',     // NULL when task is unassigned
  'reporter.name as reporter_name',
];

// ─── Base Query Builder ───────────────────────────────────────────────────────
// Encapsulates the three joins and the archived-project guard.
// Used by findAll and findById to avoid duplication.
const baseQuery = () =>
  db(TABLE)
    // Exclude tasks whose project has been archived
    .join('projects', function () {
      this.on(`${TABLE}.project_id`, 'projects.id')
          .andOnNull('projects.deleted_at'); // projects.deleted_at IS NULL
    })
    // Assignee may be null — use leftJoin so unassigned tasks still appear
    .leftJoin('users as assignee', `${TABLE}.assignee_id`, 'assignee.id')
    // Reporter is always set — use inner join
    .join('users as reporter', `${TABLE}.reporter_id`, 'reporter.id')
    .select(TASK_COLUMNS);

/**
 * Returns all tasks that belong to active (non-archived) projects.
 *
 * @returns {object[]} array of task rows with joined names
 */
const findAll = () => {
  return baseQuery().orderBy(`${TABLE}.created_at`, 'desc');
};

/**
 * Returns a single task by ID.
 * Returns undefined if not found OR if the task belongs to an archived project.
 *
 * @param {number} id
 * @returns {object|undefined}
 */
const findById = (id) => {
  return baseQuery().where(`${TABLE}.id`, id).first();
};

/**
 * Inserts a new task row and returns the full task with joined data.
 *
 * @param {object} data  { title, description, status, priority, project_id,
 *                         assignee_id, reporter_id, due_date }
 * @returns {object} the newly created task
 */
const create = async (data) => {
  const [id] = await db(TABLE).insert(data);
  return findById(id);
};

/**
 * Updates mutable task fields and returns the refreshed row.
 * Does not touch: reporter_id, project_id, status (use updateStatus for that).
 *
 * @param {number} id
 * @param {object} data  fields to update
 * @returns {object} updated task
 */
const update = async (id, data) => {
  await db(TABLE).where({ id }).update(data);
  return findById(id);
};

/**
 * Updates only the task status field.
 * Kept as a dedicated method so the PATCH /status endpoint
 * cannot accidentally update any other field.
 *
 * @param {number} id
 * @param {string} status  'todo' | 'in_progress' | 'done' | 'cancelled'
 * @returns {object} updated task
 */
const updateStatus = async (id, status) => {
  await db(TABLE).where({ id }).update({ status });
  return findById(id);
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  updateStatus,
};
