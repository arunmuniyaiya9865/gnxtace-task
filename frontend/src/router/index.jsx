/**
 * src/router/index.jsx
 *
 * Why this file exists:
 * Centralizes all route definitions.
 * LoginPage lives outside RootLayout — it has no navbar.
 * All other pages are wrapped in ProtectedRoute inside RootLayout.
 */

import { createBrowserRouter, Navigate } from 'react-router-dom';
import RootLayout       from '../layouts/RootLayout';
import ProtectedRoute   from '../components/ProtectedRoute';
import LoginPage        from '../pages/LoginPage';
import DashboardPage    from '../pages/DashboardPage';
import ProjectsPage     from '../pages/ProjectsPage';
import TasksPage        from '../pages/TasksPage';
import NotFoundPage     from '../pages/NotFoundPage';

const router = createBrowserRouter([
  // ── Public route — no layout, no auth ──────────────────────────────────────
  {
    path: '/login',
    element: <LoginPage />,
  },

  // ── Protected routes — wrapped in RootLayout + ProtectedRoute ──────────────
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        // Redirect bare / to /dashboard
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'projects',
        element: (
          <ProtectedRoute>
            <ProjectsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'tasks',
        element: (
          <ProtectedRoute>
            <TasksPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export default router;
