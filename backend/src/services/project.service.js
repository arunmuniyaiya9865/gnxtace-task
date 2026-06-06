/**
 * src/services/project.service.js
 *
 * Why this file exists:
 * Contains all business logic for the Projects module.
 * This layer is the source of truth for what is and isn't allowed.
 * It calls the repository for data and throws AppError for rule violations.
 *
 * Rules:
 * - Never import Express req/res here
 * - Never call db() directly — use the repository
 * - Throw AppError for domain failures — asyncHandler catches them
 * - Return plain sanitized objects to the controller
 *
 * Business rules enforced here:
 * 1. A project must exist before it can be updated or archived
 * 2. An archived project cannot be updated
 * 3. owner_id is always set from req.user.id — never from the request body
 */

const AppError = require('../utils/AppError');
const projectRepo = require('../repositories/project.repository');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Fetches a project by ID and enforces it exists.
 * Centralizes the "not found" check so every service method stays clean.
 *
 * @param {number} id
 * @returns {object} project row
 * @throws {AppError} 404 if not found or already archived
 */
const requireProject = async (id) => {
  const project = await projectRepo.findById(id);
  if (!project) {
    throw new AppError('Project not found', 404);
  }
  return project;
};

// ─── Service Methods ──────────────────────────────────────────────────────────

/**
 * Returns all active (non-archived) projects.
 *
 * @returns {object[]}
 */
const listProjects = async () => {
  return projectRepo.findAll();
};

/**
 * Returns a single project by ID.
 * Throws 404 if the project doesn't exist or is archived.
 *
 * @param {number} id
 * @returns {object}
 */
const getProjectById = async (id) => {
  return requireProject(id);
};

/**
 * Creates a new project.
 * owner_id is injected from the authenticated user — never from the client body.
 *
 * @param {object} body - { name, description, due_date }
 * @param {number} ownerId - req.user.id
 * @returns {object} the created project
 */
const createProject = async (body, ownerId) => {
  const { name, description = null, due_date = null } = body;

  if (!name || !name.trim()) {
    throw new AppError('Project name is required', 400);
  }

  const data = {
    name: name.trim(),
    description,
    status: 'active',       // Always starts as active — client cannot override
    owner_id: ownerId,      // Injected from JWT — never from req.body
    due_date,
  };

  return projectRepo.create(data);
};

/**
 * Updates a project's mutable fields.
 * Rules:
 * - Project must exist (requireProject throws 404 otherwise)
 * - Archived projects cannot be updated (throws 400)
 * - status, due_date, name, description are updatable
 * - owner_id is never updatable through this method
 *
 * @param {number} id
 * @param {object} body - fields to update
 * @returns {object} updated project
 */
const updateProject = async (id, body) => {
  const project = await requireProject(id);

  // Archived projects are immutable — this protects data integrity
  if (project.status === 'archived') {
    throw new AppError('Cannot modify an archived project', 400);
  }

  // Whitelist only the fields that are safe to update
  // owner_id and deleted_at are never in this object
  const allowedFields = ['name', 'description', 'status', 'due_date'];
  const updateData = {};

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field];
    }
  }

  if (Object.keys(updateData).length === 0) {
    throw new AppError('No valid fields provided for update', 400);
  }

  // Prevent client from manually setting archived via PUT
  // Archive must go through the dedicated PATCH /archive endpoint
  if (updateData.status === 'archived') {
    throw new AppError(
      "Use PATCH /projects/:id/archive to archive a project",
      400
    );
  }

  return projectRepo.update(id, updateData);
};

/**
 * Archives a project (soft delete).
 * Sets status='archived' and deleted_at=NOW().
 * After archiving, the project no longer appears in any listing.
 *
 * @param {number} id
 * @returns {{ message: string }}
 */
const archiveProject = async (id) => {
  const project = await requireProject(id);

  if (project.status === 'archived') {
    throw new AppError('Project is already archived', 400);
  }

  await projectRepo.archive(id);

  return { message: 'Project archived successfully' };
};

module.exports = {
  listProjects,
  getProjectById,
  createProject,
  updateProject,
  archiveProject,
};
