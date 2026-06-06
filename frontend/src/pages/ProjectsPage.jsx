/**
 * src/pages/ProjectsPage.jsx
 *
 * Why this file exists:
 * Displays all active projects and allows creating new ones.
 * Inline edit is handled by toggling an edit form per row.
 * All API calls go through project.service.js — never direct api.js calls.
 */

import { useState, useEffect } from 'react';
import {
  getProjects,
  createProject,
  updateProject,
} from '../services/project.service';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  // Create form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName]               = useState('');
  const [newDesc, setNewDesc]               = useState('');
  const [creating, setCreating]             = useState(false);
  const [createError, setCreateError]       = useState('');

  // Edit state — tracks which project is being edited
  const [editingId, setEditingId]     = useState(null);
  const [editName, setEditName]       = useState('');
  const [editDesc, setEditDesc]       = useState('');
  const [editStatus, setEditStatus]   = useState('active');
  const [updating, setUpdating]       = useState(false);
  const [updateError, setUpdateError] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      setProjects(await getProjects());
    } catch {
      setError('Failed to load projects.');
    } finally {
      setLoading(false);
    }
  };

  // ── Create ──────────────────────────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreating(true);
    try {
      const created = await createProject({ name: newName, description: newDesc });
      setProjects((prev) => [created, ...prev]);
      setNewName('');
      setNewDesc('');
      setShowCreateForm(false);
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create project.');
    } finally {
      setCreating(false);
    }
  };

  // ── Edit ────────────────────────────────────────────────────────────────────
  const startEdit = (project) => {
    setEditingId(project.id);
    setEditName(project.name);
    setEditDesc(project.description || '');
    setEditStatus(project.status);
    setUpdateError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setUpdateError('');
  };

  const handleUpdate = async (id) => {
    setUpdating(true);
    setUpdateError('');
    try {
      const updated = await updateProject(id, {
        name: editName,
        description: editDesc,
        status: editStatus,
      });
      setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
      setEditingId(null);
    } catch (err) {
      setUpdateError(err.response?.data?.message || 'Failed to update project.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <p style={s.msg}>Loading projects…</p>;
  if (error)   return <p style={{ ...s.msg, color: '#c0392b' }}>{error}</p>;

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h2 style={s.heading}>Projects</h2>
        <button
          id="create-project-btn"
          style={s.btnPrimary}
          onClick={() => setShowCreateForm((v) => !v)}
        >
          {showCreateForm ? 'Cancel' : '+ New Project'}
        </button>
      </div>

      {/* ── Create Form ── */}
      {showCreateForm && (
        <form onSubmit={handleCreate} style={s.form}>
          <input
            id="new-project-name"
            style={s.input}
            placeholder="Project name *"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
          <input
            id="new-project-desc"
            style={s.input}
            placeholder="Description (optional)"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
          />
          {createError && <p style={s.error}>{createError}</p>}
          <button id="submit-project-btn" type="submit" style={s.btnPrimary} disabled={creating}>
            {creating ? 'Creating…' : 'Create Project'}
          </button>
        </form>
      )}

      {/* ── Project Table ── */}
      {projects.length === 0 ? (
        <p style={s.empty}>No projects yet. Create your first one above.</p>
      ) : (
        <table style={s.table}>
          <thead>
            <tr>
              {['Name', 'Status', 'Owner', 'Due Date', 'Actions'].map((h) => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projects.map((project) =>
              editingId === project.id ? (
                <tr key={project.id} style={{ background: '#f0f7ff' }}>
                  <td style={s.td}>
                    <input
                      style={{ ...s.input, margin: 0 }}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  </td>
                  <td style={s.td}>
                    <select
                      style={s.select}
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                    >
                      <option value="active">Active</option>
                      <option value="on_hold">On Hold</option>
                    </select>
                  </td>
                  <td style={s.td}>{project.owner_name}</td>
                  <td style={s.td}>
                    <input
                      style={{ ...s.input, margin: 0 }}
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      placeholder="Description"
                    />
                  </td>
                  <td style={s.td}>
                    {updateError && <p style={s.error}>{updateError}</p>}
                    <button
                      style={s.btnSmall}
                      onClick={() => handleUpdate(project.id)}
                      disabled={updating}
                    >
                      {updating ? '…' : 'Save'}
                    </button>{' '}
                    <button style={s.btnSmallGray} onClick={cancelEdit}>
                      Cancel
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={project.id} style={s.tr}>
                  <td style={s.td}><strong>{project.name}</strong></td>
                  <td style={s.td}>
                    <StatusBadge status={project.status} />
                  </td>
                  <td style={s.td}>{project.owner_name}</td>
                  <td style={s.td}>{project.due_date || '—'}</td>
                  <td style={s.td}>
                    <button
                      style={s.btnSmall}
                      onClick={() => startEdit(project)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    active:   { bg: '#dcfce7', color: '#16a34a' },
    on_hold:  { bg: '#fef9c3', color: '#ca8a04' },
    archived: { bg: '#f3f4f6', color: '#6b7280' },
  };
  const c = colors[status] || colors.active;
  return (
    <span style={{
      padding: '2px 10px',
      borderRadius: '999px',
      fontSize: '0.78rem',
      fontWeight: 600,
      background: c.bg,
      color: c.color,
    }}>
      {status.replace('_', ' ')}
    </span>
  );
}

const s = {
  page:       { padding: '2rem', fontFamily: 'sans-serif', maxWidth: '900px' },
  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  heading:    { margin: 0, fontSize: '1.5rem', color: '#1a1a2e' },
  form:       { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' },
  input:      { padding: '9px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem', outline: 'none' },
  select:     { padding: '7px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem' },
  error:      { color: '#c0392b', fontSize: '0.82rem', margin: 0 },
  table:      { width: '100%', borderCollapse: 'collapse', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' },
  th:         { padding: '10px 14px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' },
  td:         { padding: '12px 14px', borderBottom: '1px solid #f3f4f6', fontSize: '0.9rem', color: '#374151', verticalAlign: 'middle' },
  tr:         { transition: 'background 0.15s' },
  btnPrimary: { padding: '9px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' },
  btnSmall:   { padding: '5px 14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 },
  btnSmallGray: { padding: '5px 14px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '0.82rem' },
  msg:        { padding: '2rem', fontFamily: 'sans-serif', color: '#555' },
  empty:      { color: '#9ca3af', fontStyle: 'italic', marginTop: '1rem' },
};
