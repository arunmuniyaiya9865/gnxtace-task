/**
 * src/services/task.service.js
 *
 * Why this file exists:
 * All task-related API calls in one place.
 * Pages never construct URLs or call api.js directly.
 */

import api from './api';

/** @returns {object[]} list of tasks in active projects */
export const getTasks = async () => {
  const { data } = await api.get('/tasks');
  return data.data.tasks;
};

/**
 * @param {object} payload  { title, description, priority, project_id, assignee_id, due_date }
 * @returns {object} created task
 */
export const createTask = async (payload) => {
  const { data } = await api.post('/tasks', payload);
  return data.data.task;
};

/**
 * @param {number} id
 * @param {object} payload  { title, description, priority, assignee_id, due_date }
 * @returns {object} updated task
 */
export const updateTask = async (id, payload) => {
  const { data } = await api.put(`/tasks/${id}`, payload);
  return data.data.task;
};

/**
 * @param {number} id
 * @param {string} status  'todo' | 'in_progress' | 'done' | 'cancelled'
 * @returns {object} updated task
 */
export const updateTaskStatus = async (id, status) => {
  const { data } = await api.patch(`/tasks/${id}/status`, { status });
  return data.data.task;
};
