import axios from 'axios';

// Create a configured axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Response interceptor to handle token rotation (401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401, not a retry request, and not the login request
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/register')
    ) {
      originalRequest._retry = true;

      try {
        // Attempt to rotate tokens via refresh endpoint
        await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        // Retry the original request with the new rotated access cookie
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, let the error propagate (AuthContext will log out the user)
        console.error('Session rotation failed:', refreshError.message);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
