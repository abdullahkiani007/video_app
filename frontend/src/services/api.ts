import axios from 'axios';

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/',
  withCredentials: false,
  headers: {
    'ngrok-skip-browser-warning': 'true',
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

apiClient.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    // Check if error is due to unauthorized access and we have a refresh token
    if (error.response?.status === 401 && localStorage.getItem('refresh')) {
      try {
        console.log("refresh token found");
        const refreshToken = localStorage.getItem('refresh');
        console.log("refreshToken ", refreshToken);

        // Get new access token
        const response = await apiClient.post('/auth/token/refresh/', { refresh: refreshToken });
        console.log("response ", response);

        // Save the new access token
        localStorage.setItem('access', response.data.access);

        // Retry the original request with the new token
        return apiClient(error.config);
      } catch (refreshError) {
        console.log("Token refresh failed:", refreshError);

        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('user');
        // If refresh fails, redirect to login or handle accordingly
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    if (!localStorage.getItem('access') || !localStorage.getItem('refresh')) {
      window.location.href = '/login';
    }


    // For other errors, just reject with the original error
    return Promise.reject(error);
  }
);
console.log(import.meta.env.VITE_API_URL);
// Add request interceptor for authentication
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export { apiClient };