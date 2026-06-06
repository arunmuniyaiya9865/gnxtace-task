/**
 * src/pages/TasksPage.jsx
 *
 * Why this file exists:
 * Displays all tasks from active projects.
 * Allows creating a new task (requires project_id selection).
 * Allows changing task status via an inline dropdown.
 * All API calls go through task.service.js.
 */

import { useState, useEffect } from 'react';
import { getTasks, createTask, updateTaskStatus } from '../services/task.service';
import { getProjects } from '../services/project.service';

const STATUSES   = ['todo', 'in_progress', 'done', 'cancelled'];
const PRIORITIES = ['low', 'medium', 'high'];

export default function TasksPage() {
  const [tasks, setTasks]       = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  // Create form state
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState({ title: '', description: '', priority: 'medium', project_id: '', due_date: '' });
  const [creating, setCreating]     = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const [t, p] = await Promise.all([getTasks(), getProjects()]);
        setTasks(t);
        setProjects(p);
      } catch {
        setError('Failed to load tasks.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // ── Create Task ─────────────────────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError('');
    if (!form.project_id) {
      setCreateError('Please select a project.');
      return;
    }
    setCreating(true);
    try {
      const created = await createTask({
        ...form,
        project_id: Number(form.project_id),
        due_date: form.due_date || null,
      });
      setTasks((prev) => [created, ...prev]);
      setForm({ title: '', description: '', priority: 'medium', project_id: '', due_date: '' });
      setShowForm(false);
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create task.');
    } finally {
      setCreating(false);
    }
  };

  // ── Status change inline ─────────────────────────────────────────────────────
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const updated = await updateTaskStatus(taskId, newStatus);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    } catch {
      alert('Failed to update task status.');
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) return <p style={s.msg}>Loading tasks…</p>;
  if (error)   return <p style={{ ...s.msg, color: '#c0392b' }}>{error}</p>;

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h2 style={s.heading}>Tasks</h2>
        <button
          id="create-task-btn"
          style={s.btnPrimary}
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? 'Cancel' : '+ New Task'}
        </button>
      </div>

      {/* ── Create Form ── */}
      {showForm && (
        <form onSubmit={handleCreate} style={s.form}>
          <input
            id="task-title"
            name="title"
            style={s.input}
            placeholder="Task title *"
            value={form.title}
            onChange={handleFormChange}
            required
          />

          <select
            id="task-project"
            name="project_id"
            style={s.select}
            value={form.project_id}
            onChange={handleFormChange}
            required
          >
            <option value="">Select project *</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <select
            id="task-priority"
            name="priority"
            style={s.select}
            value={form.priority}
            onChange={handleFormChange}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <input
            id="task-description"
            name="description"
            style={s.input}
            placeholder="Description (optional)"
            value={form.description}
            onChange={handleFormChange}
          />

          <input
            id="task-due-date"
            name="due_date"
            type="date"
            style={s.input}
            value={form.due_date}
            onChange={handleFormChange}
          />

          {createError && <p style={s.error}>{createError}</p>}

          <button
            id="submit-task-btn"
            type="submit"
            style={s.btnPrimary}
            disabled={creating}
          >
            {creating ? 'Creating…' : 'Create Task'}
          </button>
        </form>
      )}

      {/* ── Task Table ── */}
      {tasks.length === 0 ? (
        <p style={s.empty}>No tasks yet. Create your first one above.</p>
      ) : (
        <table style={s.table}>
          <thead>
            <tr>
              {['Title', 'Project', 'Priority', 'Status', 'Reporter', 'Due'].map((h) => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td style={s.td}><strong>{task.title}</strong></td>
                <td style={s.td}>{task.project_name}</td>
                <td style={s.td}><PriorityBadge priority={task.priority} /></td>
                <td style={s.td}>
                  {/* Inline status dropdown — calls PATCH /tasks/:id/status */}
                  <select
                    style={s.statusSelect}
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                  >
                    {STATUSES.map((st) => (
                      <option key={st} value={st}>{st.replace('_', ' ')}</option>
                    ))}
                  </select>
                </td>
                <td style={s.td}>{task.reporter_name}</td>
                <td style={s.td}>{task.due_date || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function PriorityBadge({ priority }) {
  const colors = {
    low:    { bg: '#f0fdf4', color: '#16a34a' },
    medium: { bg: '#fefce8', color: '#ca8a04' },
    high:   { bg: '#fef2f2', color: '#dc2626' },
  };
  const c = colors[priority] || colors.medium;
  return (
    <span style={{
      padding: '2px 10px',
      borderRadius: '999px',
      fontSize: '0.78rem',
      fontWeight: 600,
      background: c.bg,
      color: c.color,
    }}>
      {priority}
    </span>
  );
}

const s = {
  page:        { padding: '2rem', fontFamily: 'sans-serif', maxWidth: '1000px' },
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  heading:     { margin: 0, fontSize: '1.5rem', color: '#1a1a2e' },
  form:        { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' },
  input:       { padding: '9px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem', outline: 'none' },
  select:      { padding: '9px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem' },
  statusSelect:{ padding: '5px 8px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '0.85rem', cursor: 'pointer', background: '#fff' },
  error:       { color: '#c0392b', fontSize: '0.82rem', margin: 0 },
  table:       { width: '100%', borderCollapse: 'collapse', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' },
  th:          { padding: '10px 14px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' },
  td:          { padding: '12px 14px', borderBottom: '1px solid #f3f4f6', fontSize: '0.9rem', color: '#374151', verticalAlign: 'middle' },
  btnPrimary:  { padding: '9px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' },
  msg:         { padding: '2rem', fontFamily: 'sans-serif', color: '#555' },
  empty:       { color: '#9ca3af', fontStyle: 'italic', marginTop: '1rem' },
};
