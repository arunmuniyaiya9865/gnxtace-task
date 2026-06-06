/**
 * src/main.jsx
 *
 * Why this file exists:
 * This is the React entry point. It mounts the app into the DOM and wraps it
 * with RouterProvider so every component in the tree has access to routing.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import router from './router/index';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
