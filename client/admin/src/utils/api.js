import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.response.use(
  r => r,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('vp_token');
      if (window.location.pathname !== '/admin/login') window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default api;