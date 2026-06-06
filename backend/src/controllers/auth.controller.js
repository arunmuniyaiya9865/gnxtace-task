/**
 * src/controllers/auth.controller.js
 *
 * Why this file exists:
 * The HTTP layer for authentication.
 * Controllers are intentionally thin — they only:
 *   1. Read from req (body, cookies, user)
 *   2. Call the auth service
 *   3. Write the response (set cookies, call sendSuccess)
 *
 * Business logic lives in auth.service.js — never here.
 */

const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { refreshCookieOptions } = require('../utils/jwt.util');
const AppError = require('../utils/AppError');
const authService = require('../services/auth.service');

const REFRESH_COOKIE_NAME = 'gnxtace_refresh_token';

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const { accessToken, refreshToken, user } = await authService.login(email, password);

  // Refresh token goes into a httpOnly cookie — never in the response body
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());

  sendSuccess(res, { accessToken, user }, 'Login successful');
});

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────
const refresh = asyncHandler(async (req, res) => {
  const rawRefreshToken = req.cookies[REFRESH_COOKIE_NAME];

  const { accessToken, refreshToken } = await authService.refresh(rawRefreshToken);

  // Rotate cookie with newly issued refresh token
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());

  sendSuccess(res, { accessToken }, 'Token refreshed');
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
const logout = asyncHandler(async (req, res) => {
  const rawRefreshToken = req.cookies[REFRESH_COOKIE_NAME];

  await authService.logout(rawRefreshToken);

  // Clear the cookie from the browser
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });

  sendSuccess(res, null, 'Logged out successfully');
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
// Protected by authenticate middleware — req.user is already set
const me = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  sendSuccess(res, { user });
});

module.exports = { login, refresh, logout, me };
