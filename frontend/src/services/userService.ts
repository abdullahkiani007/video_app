import { apiClient } from './api';

export default {
  // Users
  getUsers() {
    try {
      return apiClient.get('/users/all-users/');
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  getProfile() {
    try {
      return apiClient.get('/users/me/');
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  // Authentication
  login(credentials: any) {
    if (!credentials || !credentials.username || !credentials.password) {
      throw new Error('Username and password are required');
    }
    try {
      return apiClient.post('/users/login/', credentials);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register(userData: any) {
    if (!userData || !userData.username || !userData.password) {
      throw new Error('User data is incomplete');
    }
    try {
      return apiClient.post('/users/register/', userData);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  logout() {
    try {
      return apiClient.post('/users/logout/');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }
};