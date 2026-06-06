/**
 * src/controllers/task.controller.js
 *
 * Why this file exists:
 * The HTTP layer for the Tasks module.
 * Controllers are intentionally thin — they only:
 *   1. Read from req (params, body, user)
 *   2. Call the task service
 *   3. Write the response using sendSuccess / sendCreated
 *
 * Business logic lives in task.service.js — never here.
 * Database queries live in task.repository.js — never here.
 */

const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');
const taskService = require('../services/task.service');

// ─── GET /api/tasks ───────────────────────────────────────────────────────────
const list = asyncHandler(async (req, res) => {
  const tasks = await taskService.listTasks();
  sendSuccess(res, { tasks });
});

// ─── GET /api/tasks/:id ───────────────────────────────────────────────────────
const getById = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(Number(req.params.id));
  sendSuccess(res, { task });
});

// ─── POST /api/tasks ──────────────────────────────────────────────────────────
const create = asyncHandler(async (req, res) => {
  // reporter_id is never read from req.body — always injected from the JWT
  const task = await taskService.createTask(req.body, req.user.id);
  sendCreated(res, { task }, 'Task created successfully');
});

// ─── PUT /api/tasks/:id ───────────────────────────────────────────────────────
const update = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(Number(req.params.id), req.body);
  sendSuccess(res, { task }, 'Task updated successfully');
});

// ─── PATCH /api/tasks/:id/status ─────────────────────────────────────────────
const updateStatus = asyncHandler(async (req, res) => {
  const task = await taskService.updateTaskStatus(
    Number(req.params.id),
    req.body.status
  );
  sendSuccess(res, { task }, 'Task status updated successfully');
});

module.exports = { list, getById, create, update, updateStatus };
