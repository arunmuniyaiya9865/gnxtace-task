/**
 * src/services/task.service.js
 *
 * Why this file exists:
 * Contains all business logic for the Tasks module.
 * Validates existence and state before any write operation.
 * All DB access goes through repositories — never through db() directly.
 *
 * Rules:
 * - Never import Express req/res here
 * - Throw AppError for domain failures — asyncHandler catches them
 * - reporter_id is always injected from req.user.id — never from req.body
 *
 * Business rules enforced here:
 * 1. Task must exist before update or status change
 * 2. Project must exist AND not be archived before task creation or update
 * 3. Assignee must exist when assignee_id is provided
 * 4. Status must be one of the allowed ENUM values
 * 5. reporter_id is set from req.user.id — clients cannot override it
 */

const AppError = require('../utils/AppError');
const taskRepo = require('../repositories/task.repository');
const projectRepo = require('../repositories/project.repository');
const userRepo = require('../repositories/user.repository');

// ─── Constants ────────────────────────────────────────────────────────────────

const VALID_STATUSES = ['todo', 'in_progress', 'done', 'cancelled'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];

// ─── Guards (internal helpers) ────────────────────────────────────────────────

/**
 * Fetches a task by ID and asserts it exists.
 * Also implicitly asserts the parent project is not archived
 * (repository's baseQuery joins on projects.deleted_at IS NULL).
 *
 * @param {number} id
 * @returns {object} task row
 * @throws {AppError} 404 if not found or parent project is archived
 */
const requireTask = async (id) => {
  const task = await taskRepo.findById(id);
  if (!task) {
    throw new AppError('Task not found', 404);
  }
  return task;
};

/**
 * Fetches a project by ID and asserts it is active (not archived).
 * Used before creating or updating a task — tasks cannot belong to
 * archived projects.
 *
 * @param {number} projectId
 * @returns {object} project row
 * @throws {AppError} 404 if not found, 400 if archived
 */
const requireActiveProject = async (projectId) => {
  const project = await projectRepo.findById(projectId);
  if (!project) {
    throw new AppError('Project not found', 404);
  }
  // projectRepo.findById already excludes archived (deleted_at IS NULL),
  // so reaching here means the project is active. Guard is belt-and-suspenders.
  if (project.status === 'archived') {
    throw new AppError('Cannot add or update tasks in an archived project', 400);
  }
  return project;
};

/**
 * Verifies an assignee user exists when assignee_id is provided.
 *
 * @param {number|null} assigneeId
 * @throws {AppError} 400 if the user does not exist
 */
const validateAssignee = async (assigneeId) => {
  if (assigneeId == null) return; // Unassigned is valid

  const user = await userRepo.findById(assigneeId);
  if (!user) {
    throw new AppError(`Assignee with id ${assigneeId} does not exist`, 400);
  }
};

// ─── Service Methods ──────────────────────────────────────────────────────────

/**
 * Returns all tasks belonging to active projects.
 *
 * @returns {object[]}
 */
const listTasks = async () => {
  return taskRepo.findAll();
};

/**
 * Returns a single task by ID.
 * Throws 404 if the task doesn't exist or belongs to an archived project.
 *
 * @param {number} id
 * @returns {object}
 */
const getTaskById = async (id) => {
  return requireTask(id);
};

/**
 * Creates a new task inside an active project.
 * reporter_id is always injected from the authenticated user.
 *
 * @param {object} body  { title, description, priority, assignee_id, due_date, project_id }
 * @param {number} reporterId  req.user.id
 * @returns {object} the created task
 */
const createTask = async (body, reporterId) => {
  const {
    title,
    description = null,
    priority = 'medium',
    assignee_id = null,
    due_date = null,
    project_id,
  } = body;

  // ── Input validation ─────────────────────────────────────────────────────
  if (!title || !title.trim()) {
    throw new AppError('Task title is required', 400);
  }

  if (!project_id) {
    throw new AppError('project_id is required', 400);
  }

  if (!VALID_PRIORITIES.includes(priority)) {
    throw new AppError(
      `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}`,
      400
    );
  }

  // ── Existence validation ─────────────────────────────────────────────────
  await requireActiveProject(project_id);
  await validateAssignee(assignee_id);

  const data = {
    title: title.trim(),
    description,
    status: 'todo',         // Always starts as todo — client cannot override
    priority,
    project_id,
    assignee_id,
    reporter_id: reporterId, // Injected from JWT — never from req.body
    due_date,
  };

  return taskRepo.create(data);
};

/**
 * Updates a task's mutable fields (not status — use updateTaskStatus for that).
 * Validates project is still active when project_id is being changed.
 *
 * @param {number} id
 * @param {object} body  fields to update
 * @returns {object} updated task
 */
const updateTask = async (id, body) => {
  await requireTask(id);

  // Whitelist updatable fields — reporter_id is never updatable
  const allowedFields = [
    'title',
    'description',
    'priority',
    'assignee_id',
    'due_date',
  ];

  const updateData = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field];
    }
  }

  if (Object.keys(updateData).length === 0) {
    throw new AppError('No valid fields provided for update', 400);
  }

  // Validate priority if being changed
  if (updateData.priority && !VALID_PRIORITIES.includes(updateData.priority)) {
    throw new AppError(
      `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}`,
      400
    );
  }

  // Validate new assignee if being changed
  if (updateData.assignee_id !== undefined) {
    await validateAssignee(updateData.assignee_id);
  }

  // Trim title if being changed
  if (updateData.title) {
    updateData.title = updateData.title.trim();
    if (!updateData.title) {
      throw new AppError('Task title cannot be empty', 400);
    }
  }

  return taskRepo.update(id, updateData);
};

/**
 * Updates only the task status.
 * This is the only way to change task status — PUT /tasks/:id cannot set it.
 *
 * @param {number} id
 * @param {string} status  must be one of VALID_STATUSES
 * @returns {object} updated task
 */
const updateTaskStatus = async (id, status) => {
  await requireTask(id);

  if (!status) {
    throw new AppError('status is required', 400);
  }

  if (!VALID_STATUSES.includes(status)) {
    throw new AppError(
      `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
      400
    );
  }

  return taskRepo.updateStatus(id, status);
};

module.exports = {
  listTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
};
