import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';
import { apiClient } from './api';
import type { AuthResponse, User } from '../types';

/**
 * Enhanced authentication service with improved error handling and types
 */
class AuthService {
  async login(email: string, password: string): Promise<AuthResponse> {
    const result = await apiClient.post('/api/auth/login', { email, password });
    
    if (result.success) {
      await this.storeAuthData(result.data.token || 'authenticated', email);
      return { success: true, data: result.data };
    }
    
    return { success: false, error: result.error };
  }

  async register(email: string, password: string): Promise<AuthResponse> {
    const result = await apiClient.post('/api/auth/register', { email, password });
    
    if (result.success) {
      await this.storeAuthData(result.data.token || 'authenticated', email);
      return { success: true, data: result.data };
    }
    
    return { success: false, error: result.error };
  }

  async verifyToken(): Promise<boolean> {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) return false;

    const result = await apiClient.get('/api/auth/me');
    return result.success;
  }

  async getCurrentUser(): Promise<string | null> {
    try {
      const email = await AsyncStorage.getItem(STORAGE_KEYS.USER_EMAIL);
      return email;
    } catch (error) {
      return null;
    }
  }

  async logout(): Promise<AuthResponse> {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.USER_EMAIL]);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to logout' };
    }
  }

  private async storeAuthData(token: string, email: string): Promise<void> {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.AUTH_TOKEN, token],
      [STORAGE_KEYS.USER_EMAIL, email],
    ]);
  }

  async getStoredToken(): Promise<string | null> {
    return AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }
}

export const authService = new AuthService();