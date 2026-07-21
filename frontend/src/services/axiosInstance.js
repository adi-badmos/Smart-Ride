import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://smart-ride-v65y.onrender.com/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = () => {
  refreshSubscribers.forEach((cb) => cb());
  refreshSubscribers = [];
};

const addRefreshSubscriber = (cb) => {
  refreshSubscribers.push(cb);
};

// Silent refresh: a 401 on any request other than login/register/refresh
// itself triggers exactly one attempt at POST /auth/refresh-token (which
// rotates both cookies server-side), then retries the original request
// once. Concurrent requests that 401 while a refresh is already in
// flight queue behind that same refresh instead of each firing their
// own — firing two refreshes at once would trip the backend's reuse
// detection (see auth.service.js:refreshTokens) against its own second
// call.
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const isAuthEndpoint =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/refresh-token');

    if (status !== 401 || isAuthEndpoint || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!isRefreshing) {
      isRefreshing = true;
      try {
        await axiosInstance.post('/auth/refresh-token');
        isRefreshing = false;
        onRefreshed();
      } catch (refreshError) {
        isRefreshing = false;
        refreshSubscribers = [];
        return Promise.reject(refreshError);
      }
    }

    return new Promise((resolve) => {
      addRefreshSubscriber(() => {
        resolve(axiosInstance(originalRequest));
      });
    });
  }
);

export default axiosInstance;