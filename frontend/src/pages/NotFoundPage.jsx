/**
 * src/pages/NotFoundPage.jsx
 *
 * Why this file exists:
 * React Router renders this when no route matches.
 * Gives users a friendly message instead of a blank screen.
 */

import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>404 — Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to="/">← Go back home</Link>
    </div>
  );
}
