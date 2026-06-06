/**
 * src/repositories/project.repository.js
 *
 * Why this file exists:
 * The only layer that runs Knex queries against the `projects` table.
 * Returns plain JS objects — never exposes Knex builders outside this file.
 * Business logic (ownership checks, status guards) lives in the service.
 *
 * Soft-delete contract:
 * - Every read query adds .whereNull('deleted_at')
 * - archive() sets both status='archived' AND deleted_at=NOW()
 * - There is no hard-delete method in this module
 *
 * Rules:
 * - Never throw AppError here — return null for missing rows
 * - Never receive Express req/res — pure data functions only
 */

const db = require('../config/database');

const TABLE = 'projects';

/**
 * Returns all non-archived projects with owner's name joined from users.
 * Does NOT include archived projects (deleted_at IS NOT NULL).
 *
 * @returns {object[]} array of project rows
 */
const findAll = () => {
  return db(TABLE)
    .join('users', `${TABLE}.owner_id`, 'users.id')
    .whereNull(`${TABLE}.deleted_at`)
    .select(
      `${TABLE}.id`,
      `${TABLE}.name`,
      `${TABLE}.description`,
      `${TABLE}.status`,
      `${TABLE}.owner_id`,
      `${TABLE}.due_date`,
      `${TABLE}.created_at`,
      `${TABLE}.updated_at`,
      'users.name as owner_name'
    )
    .orderBy(`${TABLE}.created_at`, 'desc');
};

/**
 * Returns a single project by ID, joined with the owner's name.
 * Returns undefined/null if not found or already archived.
 *
 * @param {number} id
 * @returns {object|undefined}
 */
const findById = (id) => {
  return db(TABLE)
    .join('users', `${TABLE}.owner_id`, 'users.id')
    .where(`${TABLE}.id`, id)
    .whereNull(`${TABLE}.deleted_at`)
    .select(
      `${TABLE}.id`,
      `${TABLE}.name`,
      `${TABLE}.description`,
      `${TABLE}.status`,
      `${TABLE}.owner_id`,
      `${TABLE}.due_date`,
      `${TABLE}.created_at`,
      `${TABLE}.updated_at`,
      'users.name as owner_name'
    )
    .first();
};

/**
 * Inserts a new project row and returns the created project.
 *
 * @param {object} data - { name, description, status, owner_id, due_date }
 * @returns {object} the newly created project row
 */
const create = async (data) => {
  const [id] = await db(TABLE).insert(data);
  return findById(id);
};

/**
 * Partially updates a project's mutable fields.
 * Only accepts: name, description, status, due_date.
 * owner_id and deleted_at are not updatable through this method.
 *
 * @param {number} id
 * @param {object} data - fields to update
 * @returns {object} the updated project row
 */
const update = async (id, data) => {
  await db(TABLE).where({ id }).update(data);
  return findById(id);
};

/**
 * Archives a project by setting status='archived' and deleted_at=NOW().
 * After this call, findById and findAll will no longer return this row.
 *
 * @param {number} id
 * @returns {number} number of rows affected
 */
const archive = (id) => {
  return db(TABLE)
    .where({ id })
    .update({
      status: 'archived',
      deleted_at: db.fn.now(),
    });
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  archive,
};
