import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, STORAGE_KEYS } from '../constants';
import { logError, createErrorResponse, isNetworkError } from '../utils/errorHandling';
import type { ApiResponse } from '../types';

/**
 * Enhanced API client with proper error handling and types
 */
class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    return {
      'Content-Type': 'application/json; charset=utf-8',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getAuthHeaders();
      const url = `${this.baseURL}${endpoint}`;

      const config: RequestInit = {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
        cache: 'no-cache',
      };

      const response = await Promise.race([
        fetch(url, config),
        new Promise<Response>((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), this.timeout)
        ),
      ]);

      if (!response.ok) {
        const errorData = await response.text();
        let errorMessage = `HTTP ${response.status}`;
        
        try {
          const parsed = JSON.parse(errorData);
          errorMessage = parsed.message || errorMessage;
        } catch {
          // Keep default error message
        }

        throw createErrorResponse(errorMessage, response.status.toString());
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      logError(error, `API Request: ${endpoint}`);
      
      const errorMessage = isNetworkError(error)
        ? 'Network error. Please check your connection.'
        : error instanceof Error
        ? error.message
        : 'An unexpected error occurred';

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();