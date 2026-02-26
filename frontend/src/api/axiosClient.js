import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  withCredentials: true, // CRITICAL: sends HttpOnly cookies automatically
  headers: { 'Content-Type': 'application/json' }
});

// URLs that should NEVER trigger the 401-refresh-redirect cycle
const AUTH_URLS = ['/auth/me', '/auth/login', '/auth/refresh', '/auth/logout', '/auth/register'];

// Response interceptor for 401 ΓåÆ auto-refresh (ONLY for protected API calls)
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || '';

    // Skip interceptor for auth-related endpoints to prevent infinite loops
    const isAuthUrl = AUTH_URLS.some(url => requestUrl.includes(url));
    if (isAuthUrl) {
      return Promise.reject(error);
    }

    // Only attempt refresh once per request, and only on 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
        await axios.post(`${apiUrl}/auth/refresh`, {}, { withCredentials: true });
        return api(originalRequest);
      } catch (refreshError) {
        // Don't force redirect ΓÇö let the component handle it
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
