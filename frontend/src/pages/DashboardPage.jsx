/**
 * src/pages/DashboardPage.jsx
 *
 * Why this file exists:
 * Landing page after login. Shows summary counts for projects and tasks.
 * Fetches both lists in parallel and counts them client-side.
 * No analytics, no charts — just functional counts.
 */

import { useState, useEffect } from 'react';
import { getProjects } from '../services/project.service';
import { getTasks } from '../services/task.service';

export default function DashboardPage() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [p, t] = await Promise.all([getProjects(), getTasks()]);
        setProjects(p);
        setTasks(t);
      } catch {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Derived counts from the fetched data
  const todoCount        = tasks.filter((t) => t.status === 'todo').length;
  const inProgressCount  = tasks.filter((t) => t.status === 'in_progress').length;
  const doneCount        = tasks.filter((t) => t.status === 'done').length;

  if (loading) return <p style={styles.msg}>Loading dashboard…</p>;
  if (error)   return <p style={{ ...styles.msg, color: '#c0392b' }}>{error}</p>;

  return (
    <div style={styles.page}>
      <h2 style={styles.heading}>Dashboard</h2>

      <div style={styles.grid}>
        <StatCard label="Total Projects" value={projects.length} color="#2563eb" />
        <StatCard label="Total Tasks"    value={tasks.length}    color="#7c3aed" />
        <StatCard label="To Do"          value={todoCount}        color="#d97706" />
        <StatCard label="In Progress"    value={inProgressCount}  color="#0891b2" />
        <StatCard label="Done"           value={doneCount}        color="#16a34a" />
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={styles.card}>
      <p style={styles.cardLabel}>{label}</p>
      <p style={{ ...styles.cardValue, color }}>{value}</p>
    </div>
  );
}

const styles = {
  page: {
    padding: '2rem',
    fontFamily: 'sans-serif',
    maxWidth: '900px',
  },
  heading: {
    marginBottom: '1.5rem',
    fontSize: '1.5rem',
    color: '#1a1a2e',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '16px',
  },
  card: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '1.25rem 1rem',
    textAlign: 'center',
  },
  cardLabel: {
    margin: '0 0 8px',
    fontSize: '0.8rem',
    color: '#6b7280',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  cardValue: {
    margin: 0,
    fontSize: '2.25rem',
    fontWeight: 700,
  },
  msg: {
    padding: '2rem',
    fontFamily: 'sans-serif',
    color: '#555',
  },
};
