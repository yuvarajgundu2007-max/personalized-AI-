import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adaptiveai_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adaptiveai_token');
      localStorage.removeItem('adaptiveai_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// Profile
export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
};

// Preferences
export const preferencesAPI = {
  get: () => api.get('/preferences'),
  update: (data) => api.put('/preferences', data),
  clearHistory: () => api.delete('/preferences/history'),
  reset: () => api.post('/preferences/reset'),
};

// Recommendations
export const recommendationsAPI = {
  get: (params = {}) => api.get('/recommendations', { params }),
  feedback: (id, action) => api.post(`/recommendations/${id}/feedback`, { action }),
  action: (id, action) => api.post(`/recommendations/${id}/action`, { action }),
  explain: (id) => api.get(`/recommendations/${id}/explain`),
};

// Interactions
export const interactionsAPI = {
  track: (data) => api.post('/interactions', data),
  get: (params = {}) => api.get('/interactions', { params }),
};

// Personalization
export const personalizationAPI = {
  profile: () => api.get('/personalization/profile'),
  insights: () => api.get('/personalization/insights'),
  refresh: () => api.post('/personalization/refresh'),
  analytics: () => api.get('/personalization/analytics'),
};

// AI
export const aiAPI = {
  chat: (message, history = []) => api.post('/ai/chat', { message, history }),
  personalize: () => api.post('/ai/personalize'),
};

// Content
export const contentAPI = {
  getAll: (params = {}) => api.get('/content', { params }),
  getById: (id) => api.get(`/content/${id}`),
};

export default api;
