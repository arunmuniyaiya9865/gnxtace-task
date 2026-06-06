/**
 * src/services/project.service.js
 *
 * Why this file exists:
 * All project-related API calls in one place.
 * Pages never construct URLs or call api.js directly.
 */

import api from './api';

/** @returns {object[]} list of active projects */
export const getProjects = async () => {
  const { data } = await api.get('/projects');
  return data.data.projects;
};

/**
 * @param {object} payload  { name, description, due_date }
 * @returns {object} created project
 */
export const createProject = async (payload) => {
  const { data } = await api.post('/projects', payload);
  return data.data.project;
};

/**
 * @param {number} id
 * @param {object} payload  { name, description, status, due_date }
 * @returns {object} updated project
 */
export const updateProject = async (id, payload) => {
  const { data } = await api.put(`/projects/${id}`, payload);
  return data.data.project;
};

/**
 * @param {number} id
 * @returns {object} API response data
 */
export const archiveProject = async (id) => {
  const { data } = await api.patch(`/projects/${id}/archive`);
  return data.data;
};
