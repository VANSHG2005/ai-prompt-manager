import axios from 'axios';
import { isTokenExpired } from '../utils/token';

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

// Helper to trigger expiration handling across the app
function handleSessionExpired() {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  window.dispatchEvent(new CustomEvent('auth:session-expired'));

  const publicPaths = ['/login', '/register'];
  if (!publicPaths.includes(window.location.pathname)) {
    window.location.href = '/login?expired=true';
  }
}

// ── Request interceptor — attach JWT and check pre-flight expiry ───────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      if (isTokenExpired(token)) {
        handleSessionExpired();
        return Promise.reject(new Error('Session expired. Please sign in again.'));
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — handle errors and 401 unauthorized ─────────────
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

    const { status, config: originalRequest } = error.response;

    // 401 Unauthorized handling — token expired or invalid
    if (status === 401) {
      const url = originalRequest?.url || '';

      // Don't intercept login or register endpoint 401s (let form show error message)
      if (url.includes('/auth/login') || url.includes('/auth/register')) {
        return Promise.reject(error);
      }

      // Any 401 on protected routes means token is expired or invalid -> logout
      handleSessionExpired();
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;
