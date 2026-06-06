/**
 * src/routes/auth.routes.js
 *
 * Why this file exists:
 * Maps HTTP methods + paths to controller functions.
 * Applies the authenticate middleware only to routes that need a valid token.
 * Routes never contain business logic — only wiring.
 *
 * Endpoints:
 *   POST /api/auth/login    → public
 *   POST /api/auth/refresh  → public (validated by cookie + DB, not JWT)
 *   POST /api/auth/logout   → protected (must be logged in to log out)
 *   GET  /api/auth/me       → protected
 */

const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const authenticate = require('../middleware/authenticate');

const router = Router();

router.post('/login',   authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout',  authenticate, authController.logout);
router.get('/me',       authenticate, authController.me);

module.exports = router;
