/**
 * src/services/auth.service.js
 *
 * Why this file exists:
 * Centralizes all auth API calls in one place.
 * Pages never call api.js directly for auth — they use these functions.
 * Token storage/removal lives here so it is never scattered across pages.
 */

import api from './api';

/**
 * Logs in with email + password.
 * Stores the access token in localStorage on success.
 *
 * @param {string} email
 * @param {string} password
 * @returns {object} user object from the API
 */
export const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  // api.js interceptor will attach this on every future request
  localStorage.setItem('token', data.data.accessToken);
  return data.data.user;
};

/**
 * Logs out the current user.
 * Removes the token from localStorage and calls the backend to revoke
 * the refresh token cookie.
 */
export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } finally {
    // Always clear local token even if the API call fails
    localStorage.removeItem('token');
  }
};

/**
 * Returns true if a token exists in localStorage.
 * Used by ProtectedRoute to guard pages without an API call.
 *
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return Boolean(localStorage.getItem('token'));
};
