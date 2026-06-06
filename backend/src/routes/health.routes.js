/**
 * src/routes/health.routes.js
 *
 * Why this file exists:
 * A health check endpoint is required by Docker, Kubernetes, and load balancers
 * to know if the service is alive. It also gives developers a fast way to verify
 * the API is running and the DB is reachable without needing any auth tokens.
 */

const { Router } = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const db = require('../config/database');

const router = Router();

/**
 * GET /api/health
 * Returns server status and database connectivity.
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    let dbStatus = 'connected';

    try {
      await db.raw('SELECT 1');
    } catch {
      dbStatus = 'disconnected';
    }

    sendSuccess(res, {
      status: 'ok',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      database: dbStatus,
    });
  })
);

module.exports = router;
