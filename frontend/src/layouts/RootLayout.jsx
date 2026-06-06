/**
 * src/layouts/RootLayout.jsx
 *
 * Why this file exists:
 * React Router renders all child routes inside this component.
 * It's the spot for elements that should persist across page navigations:
 * navigation bar, sidebar, footer, toast notifications, etc.
 * <Outlet /> is the placeholder where the matched child route renders.
 */

import { Outlet } from 'react-router-dom';

export default function RootLayout() {
  return (
    <div className="app-root">
      {/* Global navigation will go here */}
      <main>
        <Outlet />
      </main>
      {/* Global footer will go here */}
    </div>
  );
}
