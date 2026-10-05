import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('reloop_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh and error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('reloop_refresh_token');
        if (refreshToken) {
          const { data } = await axios.post('/api/auth/refresh', { refreshToken });
          localStorage.setItem('reloop_token', data.token);
          localStorage.setItem('reloop_refresh_token', data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${data.token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('reloop_token');
        localStorage.removeItem('reloop_refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('reloop_token');
      localStorage.removeItem('reloop_refresh_token');
    }

    return Promise.reject(error);
  }
);

export default api;
