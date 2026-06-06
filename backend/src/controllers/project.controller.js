/**
 * src/controllers/project.controller.js
 *
 * Why this file exists:
 * The HTTP layer for the Projects module.
 * Controllers are intentionally thin — they only:
 *   1. Read from req (params, body, user)
 *   2. Call the project service
 *   3. Write the response using sendSuccess / sendCreated
 *
 * Business logic lives in project.service.js — never here.
 * Database queries live in project.repository.js — never here.
 */

const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');
const projectService = require('../services/project.service');

// ─── GET /api/projects ────────────────────────────────────────────────────────
const list = asyncHandler(async (req, res) => {
  const projects = await projectService.listProjects();
  sendSuccess(res, { projects });
});

// ─── GET /api/projects/:id ────────────────────────────────────────────────────
const getById = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectById(Number(req.params.id));
  sendSuccess(res, { project });
});

// ─── POST /api/projects ───────────────────────────────────────────────────────
const create = asyncHandler(async (req, res) => {
  // owner_id is never read from req.body — always injected from the JWT
  const project = await projectService.createProject(req.body, req.user.id);
  sendCreated(res, { project }, 'Project created successfully');
});

// ─── PUT /api/projects/:id ────────────────────────────────────────────────────
const update = asyncHandler(async (req, res) => {
  const project = await projectService.updateProject(Number(req.params.id), req.body);
  sendSuccess(res, { project }, 'Project updated successfully');
});

// ─── PATCH /api/projects/:id/archive ─────────────────────────────────────────
const archive = asyncHandler(async (req, res) => {
  const result = await projectService.archiveProject(Number(req.params.id));
  sendSuccess(res, result, 'Project archived successfully');
});

module.exports = { list, getById, create, update, archive };
