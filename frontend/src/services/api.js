import axios from 'axios';

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

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

export default {
  // Conversations
  getConversations() {
    return apiClient.get('chat/conversations/');
  },
  getConversation(id) {
    return apiClient.get(`chat/conversations/${id}/`);
  },
  createConversation(data) {
    return apiClient.post('chat/conversations/', data);
  },

  // Messages
  getMessages() {
    return apiClient.get(`chat/messages/`);
  },
  sendMessage(data) {
    return apiClient.post('chat/messages/', data);
  },

  // Users
  getUsers() {
    return apiClient.get('/users/all-users/');
  },
  getProfile() {
    return apiClient.get('/users/me/');
  },

  // Authentication
  login(credentials) {
    return apiClient.post('/users/login/', credentials);
  },
  register(userData) {
    return apiClient.post('/users/register/', userData);
  },
  logout() {
    return apiClient.post('/users/logout/');
  }
};