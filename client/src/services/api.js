import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// AI Services
export const aiAPI = {
  chat: (messages, options) =>
    api.post('/ai/chat', { messages, ...options }),

  generatePlan: (context) =>
    api.post('/ai/generate-plan', context),

  analyzeProgress: (userId) =>
    api.post('/ai/analyze-progress', { userId }),

  suggestNextAction: (userId, context) =>
    api.post('/ai/suggest-next-action', { userId, ...context }),
};

// Learning Plans
export const plansAPI = {
  list: (params) => api.get('/plans', { params }),
  get: (id) => api.get(`/plans/${id}`),
  create: (data) => api.post('/plans', data),
  update: (id, data) => api.patch(`/plans/${id}`, data),
  delete: (id) => api.delete(`/plans/${id}`),
};

// Tasks
export const tasksAPI = {
  list: (params) => api.get('/tasks', { params }),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.patch(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
};

// Study Sessions
export const sessionsAPI = {
  list: (params) => api.get('/sessions', { params }),
  start: (data) => api.post('/sessions', data),
  complete: (id, data) => api.patch(`/sessions/${id}/complete`, data),
};

// Analytics
export const analyticsAPI = {
  overview: (userId) => api.get('/analytics/overview', { params: { userId } }),
  streaks: (userId) => api.get('/analytics/streaks', { params: { userId } }),
  timeTracking: (userId, days) =>
    api.get('/analytics/time-tracking', { params: { userId, days } }),
};

// Templates
export const templatesAPI = {
  list: (params) => api.get('/templates', { params }),
  get: (id) => api.get(`/templates/${id}`),
};

export default api;
