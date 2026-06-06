/**
 * src/layouts/RootLayout.jsx
 *
 * Why this file exists:
 * Persistent shell rendered around every protected page.
 * Contains the top navbar with navigation links and logout.
 * <Outlet /> renders the matched child route.
 */

import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../services/auth.service';

export default function RootLayout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={s.shell}>
      {/* ── Top Navbar ── */}
      <nav style={s.nav}>
        <span style={s.brand}>Gnxtace</span>

        <div style={s.links}>
          <NavLink
            to="/dashboard"
            style={({ isActive }) => ({ ...s.link, ...(isActive ? s.linkActive : {}) })}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/projects"
            style={({ isActive }) => ({ ...s.link, ...(isActive ? s.linkActive : {}) })}
          >
            Projects
          </NavLink>
          <NavLink
            to="/tasks"
            style={({ isActive }) => ({ ...s.link, ...(isActive ? s.linkActive : {}) })}
          >
            Tasks
          </NavLink>
        </div>

        <button id="logout-btn" onClick={handleLogout} style={s.logoutBtn}>
          Logout
        </button>
      </nav>

      {/* ── Page content ── */}
      <main style={s.main}>
        <Outlet />
      </main>
    </div>
  );
}

const s = {
  shell:     { minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f5f5f5', fontFamily: 'sans-serif' },
  nav:       { display: 'flex', alignItems: 'center', gap: '24px', padding: '0 2rem', height: '56px', background: '#1a1a2e', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' },
  brand:     { fontWeight: 700, fontSize: '1.15rem', color: '#fff', marginRight: '8px', letterSpacing: '0.03em' },
  links:     { display: 'flex', gap: '4px', flex: 1 },
  link:      { padding: '6px 14px', borderRadius: '5px', color: '#cbd5e1', fontSize: '0.9rem', textDecoration: 'none', fontWeight: 500 },
  linkActive:{ background: '#2563eb', color: '#fff' },
  logoutBtn: { marginLeft: 'auto', padding: '6px 16px', background: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: '5px', cursor: 'pointer', fontSize: '0.85rem' },
  main:      { flex: 1, padding: '0', overflow: 'auto' },
};
