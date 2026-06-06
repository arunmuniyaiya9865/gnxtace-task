/**
 * src/middleware/authorize.js
 *
 * Why this file exists:
 * Enforces permission-based access control on protected routes.
 * Works as a middleware factory — call it with a permission string and it
 * returns an Express middleware. This separates *who you are* (authenticate)
 * from *what you are allowed to do* (authorize).
 *
 * Usage (always after authenticate):
 *   router.post('/', authenticate, authorize('projects:create'), controller.create);
 *   router.put('/:id', authenticate, authorize('projects:update'), controller.update);
 *
 * What it does NOT do:
 * - Does not verify the JWT (that's authenticate's job)
 * - Does not query the database directly (all queries stay in permission.repository.js)
 * - Does not implement caching, wildcards, or super-admin shortcuts
 */

const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const permissionRepository = require('../repositories/permission.repository');

/**
 * Middleware factory for permission-based authorization.
 *
 * @param {string} permission - The required permission string (e.g. 'projects:create')
 * @returns {Function} Express middleware that allows or blocks the request
 *
 * @example
 * router.post('/', authenticate, authorize('projects:create'), projectController.create);
 */
const authorize = (permission) => {
  return asyncHandler(async (req, res, next) => {
    // ── 1. Guard: req.user must exist ─────────────────────────────────────────
    // authenticate always runs first; this is a defensive check against
    // misconfigured routes that skip authenticate entirely.
    if (!req.user || !req.user.id) {
      throw new AppError('Authentication required', 401);
    }

    // ── 2. Load this user's permissions from the database ────────────────────
    // Delegates entirely to the repository — this middleware never builds
    // Knex queries. Returns a flat string[] like ['projects:read', 'tasks:create']
    const userPermissions = await permissionRepository.getPermissionsByUserId(req.user.id);

    // ── 3. Check whether the required permission is present ──────────────────
    if (!userPermissions.includes(permission)) {
      throw new AppError(
        `Forbidden: you do not have the '${permission}' permission`,
        403
      );
    }

    // ── 4. Permission confirmed — hand off to the next handler ───────────────
    next();
  });
};

module.exports = authorize;
