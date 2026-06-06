/**
 * src/routes/index.js
 *
 * Why this file exists:
 * This is the single entry point for ALL API routes.
 * app.js mounts this at /api, so every route is automatically prefixed.
 * As you add modules (auth, projects, tasks), you register them here —
 * app.js never needs to change.
 */

const { Router } = require('express');
const healthRouter = require('./health.routes');
const authRouter = require('./auth.routes');
const projectRouter = require('./project.routes');

const router = Router();

// ─── Module Routes ────────────────────────────────────────────────────────────
// Register new feature routers here as the platform grows.

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/projects', projectRouter);

module.exports = router;
