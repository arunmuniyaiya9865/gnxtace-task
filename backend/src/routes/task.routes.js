/**
 * src/routes/task.routes.js
 *
 * Why this file exists:
 * Maps HTTP methods + paths to controller functions for the Tasks module.
 * Every route is protected by authenticate + authorize.
 * This file contains zero business logic — only wiring.
 *
 * Middleware stack per route:
 *   authenticate  → verifies JWT, sets req.user
 *   authorize(p)  → loads DB permissions, checks required permission string
 *   controller    → executes the action
 *
 * Endpoints:
 *   GET    /api/tasks              → tasks:read
 *   GET    /api/tasks/:id          → tasks:read
 *   POST   /api/tasks              → tasks:create
 *   PUT    /api/tasks/:id          → tasks:update
 *   PATCH  /api/tasks/:id/status   → tasks:update
 *
 * Note on PATCH /status:
 * This route is declared BEFORE /:id to prevent Express from matching
 * "status" as the :id param on a PUT /:id route.
 */

const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const taskController = require('../controllers/task.controller');

const router = Router();

// ─── Read ─────────────────────────────────────────────────────────────────────
router.get(
  '/',
  authenticate,
  authorize('tasks:read'),
  taskController.list
);

router.get(
  '/:id',
  authenticate,
  authorize('tasks:read'),
  taskController.getById
);

// ─── Create ───────────────────────────────────────────────────────────────────
router.post(
  '/',
  authenticate,
  authorize('tasks:create'),
  taskController.create
);

// ─── Update fields ────────────────────────────────────────────────────────────
router.put(
  '/:id',
  authenticate,
  authorize('tasks:update'),
  taskController.update
);

// ─── Update status only ───────────────────────────────────────────────────────
// PATCH is used — only the status field changes, nothing else.
// Kept as a dedicated endpoint so clients cannot mutate other fields here.
router.patch(
  '/:id/status',
  authenticate,
  authorize('tasks:update'),
  taskController.updateStatus
);

module.exports = router;
