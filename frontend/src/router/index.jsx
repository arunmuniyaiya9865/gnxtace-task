/**
 * src/router/index.jsx
 *
 * Why this file exists:
 * Centralizes all route definitions. As pages are added, they are registered
 * here — no other file needs to know the URL structure.
 * Using React Router v6 createBrowserRouter for proper data router support.
 */

import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout';
import NotFoundPage from '../pages/NotFoundPage';
import HomePage from '../pages/HomePage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      // ── Register new pages here as you build the platform ──────────────────
      // { path: 'login',    element: <LoginPage /> },
      // { path: 'dashboard', element: <DashboardPage /> },
      // { path: 'projects', element: <ProjectsPage /> },
    ],
    errorElement: <NotFoundPage />,
  },
]);

export default router;
