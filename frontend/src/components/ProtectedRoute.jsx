/**
 * src/components/ProtectedRoute.jsx
 *
 * Why this file exists:
 * Guards routes that require authentication.
 * Checks for a token in localStorage — no API call needed.
 * If the token is missing, redirects to /login immediately.
 * The api.js response interceptor handles token expiry at runtime.
 *
 * Usage:
 *   { path: 'dashboard', element: <ProtectedRoute><DashboardPage /></ProtectedRoute> }
 */

import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../services/auth.service';

export default function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
