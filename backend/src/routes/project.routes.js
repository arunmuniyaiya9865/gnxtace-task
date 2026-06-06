/**
 * src/routes/project.routes.js
 *
 * Why this file exists:
 * Maps HTTP methods + paths to controller functions for the Projects module.
 * Every route is protected by authenticate + authorize.
 * This file contains zero business logic — only wiring.
 *
 * Middleware stack per route:
 *   authenticate  → verifies JWT, sets req.user
 *   authorize(p)  → loads DB permissions, checks required string
 *   controller    → executes the action
 *
 * Endpoints:
 *   GET    /api/projects              → projects:read
 *   GET    /api/projects/:id          → projects:read
 *   POST   /api/projects              → projects:create
 *   PUT    /api/projects/:id          → projects:update
 *   PATCH  /api/projects/:id/archive  → projects:update
 */

const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const projectController = require('../controllers/project.controller');

const router = Router();

// ─── Read ─────────────────────────────────────────────────────────────────────
router.get(
  '/',
  authenticate,
  authorize('projects:read'),
  projectController.list
);

router.get(
  '/:id',
  authenticate,
  authorize('projects:read'),
  projectController.getById
);

// ─── Write ────────────────────────────────────────────────────────────────────
router.post(
  '/',
  authenticate,
  authorize('projects:create'),
  projectController.create
);

router.put(
  '/:id',
  authenticate,
  authorize('projects:update'),
  projectController.update
);

// ─── Archive (soft delete) ────────────────────────────────────────────────────
// PATCH is used — not DELETE — because this is a status transition, not removal.
// The record stays in the database; deleted_at is set, not a row dropped.
router.patch(
  '/:id/archive',
  authenticate,
  authorize('projects:update'),
  projectController.archive
);

module.exports = router;
