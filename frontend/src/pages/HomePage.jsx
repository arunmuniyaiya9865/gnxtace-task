/**
 * src/pages/HomePage.jsx
 *
 * Why this file exists:
 * The landing page of the application — rendered at route `/`.
 * At this stage it is a minimal placeholder so routing works end-to-end.
 * Replace this content as you build the actual dashboard.
 */

export default function HomePage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Gnxtace</h1>
      <p>Project Management Platform — foundation ready.</p>
      <p>
        API Health:{' '}
        <a href="http://localhost:5000/api/health" target="_blank" rel="noreferrer">
          http://localhost:5000/api/health
        </a>
      </p>
    </div>
  );
}
