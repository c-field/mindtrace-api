import { apiClient } from './api';
import { formatDateRangeForApi } from '../utils/dateHelpers';
import type { Thought, CreateThoughtData, ApiResponse } from '../types';

/**
 * Enhanced thought service with improved type safety and error handling
 */
class ThoughtService {
  async createThought(thoughtData: CreateThoughtData): Promise<ApiResponse<Thought>> {
    return apiClient.post<Thought>('/api/thoughts', thoughtData);
  }

  async getThoughts(dateFrom?: Date, dateTo?: Date): Promise<Thought[]> {
    let endpoint = '/api/thoughts';
    
    if (dateFrom && dateTo) {
      const { dateFrom: from, dateTo: to } = formatDateRangeForApi(dateFrom, dateTo);
      const params = new URLSearchParams({ dateFrom: from, dateTo: to });
      endpoint += `?${params.toString()}`;
    }

    const result = await apiClient.get<Thought[]>(endpoint);
    return result.success ? result.data || [] : [];
  }

  async deleteThought(thoughtId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/api/thoughts/${thoughtId}`);
  }

  async updateThought(thoughtId: string, updates: Partial<CreateThoughtData>): Promise<ApiResponse<Thought>> {
    return apiClient.put<Thought>(`/api/thoughts/${thoughtId}`, updates);
  }

  async exportThoughts(dateFrom?: Date, dateTo?: Date): Promise<ApiResponse<string>> {
    let endpoint = '/api/export/csv';
    
    if (dateFrom && dateTo) {
      const { dateFrom: from, dateTo: to } = formatDateRangeForApi(dateFrom, dateTo);
      const params = new URLSearchParams({ dateFrom: from, dateTo: to });
      endpoint += `?${params.toString()}`;
    }

    const result = await apiClient.get<string>(endpoint);
    
    if (result.success) {
      // For CSV export, we need to handle text response differently
      try {
        const response = await fetch(`${apiClient['baseURL']}${endpoint}`, {
          headers: await apiClient['getAuthHeaders'](),
        });
        
        if (response.ok) {
          const csvData = await response.text();
          return { success: true, data: csvData };
        }
        
        return { success: false, error: 'Failed to export data' };
      } catch (error) {
        return { success: false, error: 'Network error during export' };
      }
    }
    
    return result;
  }

  async getThoughtById(thoughtId: string): Promise<ApiResponse<Thought>> {
    return apiClient.get<Thought>(`/api/thoughts/${thoughtId}`);
  }
}

export const thoughtService = new ThoughtService();