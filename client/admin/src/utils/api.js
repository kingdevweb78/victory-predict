import axios from 'axios';
const api = axios.create({ baseURL: '/api' });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});
api.interceptors.response.use((res) => res, (err) => {
  if (err.response?.status === 401) { localStorage.removeItem('token'); window.location.href = '/admin/login'; }
  return Promise.reject(err);
});
export default api;
export const authAPI = { login: (email, password) => api.post('/auth/admin-login', { email, password }), me: () => api.get('/auth/me') };
export const usersAPI = { getAll: () => api.get('/users'), getById: (id) => api.get('/users/' + id) };
export const paymentsAPI = { getAll: (params) => api.get('/payments', { params }), approve: (id) => api.post('/payments/' + id + '/approve'), reject: (id) => api.post('/payments/' + id + '/reject') };
export const predictionsAPI = { getAll: (params) => api.get('/predictions', { params }), create: (data) => api.post('/predictions', data), delete: (id) => api.delete('/predictions/' + id) };
export const groupsAPI = { getAll: () => api.get('/groups'), toggle: (id) => api.post('/groups/' + id + '/toggle') };
export const settingsAPI = { getAll: () => api.get('/settings'), update: (key, value) => api.put('/settings', { key, value }) };
export const adminAPI = { stats: () => api.get('/admin/stats'), backup: () => api.post('/admin/backup'), restore: (f) => api.post('/admin/restore', { filename: f }) };
