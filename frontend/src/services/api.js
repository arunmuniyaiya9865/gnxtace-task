/**
 * src/services/api.js
 *
 * Why this file exists:
 * This is the single Axios instance used by all frontend feature modules.
 * Centralizing it here means:
 *   - The base URL is set in ONE place (reads from .env via import.meta.env)
 *   - Auth tokens, headers, and error interceptors are configured once
 *   - Feature services import this — they never create their own axios instances
 *
 * Usage:
 *   import api from './api';
 *   const { data } = await api.get('/projects');
 */

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Attach the auth token to every request automatically.
// When you implement authentication, store the token here.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ────────────────────────────────────────────────────
// Global error handling: redirect to /login on 401, log errors consistently.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      // Token expired or invalid — redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
