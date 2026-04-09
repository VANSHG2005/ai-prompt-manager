import axios from 'axios';

// ── Base URL resolution ───────────────────────────────────────────────────
function resolveApiBaseUrl() {
  const env = import.meta.env.VITE_API_URL;

  // If env var is provided, use it directly (strip trailing slash)
  if (env) {
    const trimmed = env.replace(/\/+$/, '');
    // Ensure it ends with /api
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }

  // Fallback: same-origin /api (works when frontend and backend are co-deployed,
  // or when Vite proxy is set up in dev)
  return '/api';
}

const API_BASE_URL = resolveApiBaseUrl();

// ── Axios instance ────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000, // 15-second timeout — prevents infinite loading spinners
});

// ── Request interceptor — attach JWT ─────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — handle errors globally ─────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network / timeout errors
    if (!error.response) {
      const networkError = new Error(
        error.code === 'ECONNABORTED'
          ? 'Request timed out. Please check your connection and try again.'
          : 'Unable to reach the server. Please check your connection.'
      );
      networkError.isNetworkError = true;
      return Promise.reject(networkError);
    }

    // 401 — session expired
    if (error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on a public page
      const publicPaths = ['/', '/login', '/register'];
      if (!publicPaths.includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
