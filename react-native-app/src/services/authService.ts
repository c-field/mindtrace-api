import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://11d3d8eb-500f-47e4-982c-6840c979c26a-00-29fzi9wm5gkmr.riker.replit.dev';

export const authService = {
  async login(email: string, password: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (response.ok) {
        await AsyncStorage.setItem('authToken', data.token || 'authenticated');
        await AsyncStorage.setItem('userEmail', email);
        return { success: true, data };
      } else {
        return { success: false, error: data.message || 'Login failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  },

  async register(email: string, password: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (response.ok) {
        await AsyncStorage.setItem('authToken', data.token || 'authenticated');
        await AsyncStorage.setItem('userEmail', email);
        return { success: true, data };
      } else {
        return { success: false, error: data.message || 'Registration failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  },

  async verifyToken(token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json; charset=utf-8',
        },
      });
      
      return response.ok;
    } catch (error) {
      return false;
    }
  },

  async logout() {
    try {
      await AsyncStorage.multiRemove(['authToken', 'userEmail']);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Logout failed' };
    }
  },

  async getCurrentUser() {
    try {
      const email = await AsyncStorage.getItem('userEmail');
      return email;
    } catch (error) {
      return null;
    }
  }
};