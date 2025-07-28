import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://11d3d8eb-500f-47e4-982c-6840c979c26a-00-29fzi9wm5gkmr.riker.replit.dev';

export interface Thought {
  id: string;
  content: string;
  cognitive_distortion: string;
  intensity: number;
  trigger: string;
  created_at: string;
}

export interface CreateThoughtData {
  content: string;
  cognitiveDistortion: string;
  intensity: number;
  trigger: string;
}

async function getAuthHeaders() {
  const token = await AsyncStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json; charset=utf-8',
    'Authorization': token ? `Bearer ${token}` : '',
  };
}

export const thoughtService = {
  async createThought(thoughtData: CreateThoughtData) {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/thoughts`, {
        method: 'POST',
        headers,
        body: JSON.stringify(thoughtData),
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.message || 'Failed to create thought' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  },

  async getThoughts(dateFrom?: string, dateTo?: string): Promise<Thought[]> {
    try {
      const headers = await getAuthHeaders();
      let url = `${API_BASE_URL}/api/thoughts`;
      
      if (dateFrom || dateTo) {
        const params = new URLSearchParams();
        if (dateFrom) params.append('dateFrom', dateFrom);
        if (dateTo) params.append('dateTo', dateTo);
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers,
        cache: 'no-cache',
      });

      if (response.ok) {
        const data = await response.json();
        return data || [];
      } else {
        throw new Error('Failed to fetch thoughts');
      }
    } catch (error) {
      console.error('Error fetching thoughts:', error);
      return [];
    }
  },

  async deleteThought(thoughtId: string) {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/thoughts/${thoughtId}`, {
        method: 'DELETE',
        headers,
      });

      if (response.ok) {
        return { success: true };
      } else {
        const data = await response.json();
        return { success: false, error: data.message || 'Failed to delete thought' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  },

  async exportThoughts(dateFrom?: string, dateTo?: string) {
    try {
      const headers = await getAuthHeaders();
      let url = `${API_BASE_URL}/api/export/csv`;
      
      if (dateFrom || dateTo) {
        const params = new URLSearchParams();
        if (dateFrom) params.append('dateFrom', dateFrom);
        if (dateTo) params.append('dateTo', dateTo);
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers,
      });

      if (response.ok) {
        const csvData = await response.text();
        return { success: true, data: csvData };
      } else {
        const data = await response.json();
        return { success: false, error: data.message || 'Failed to export thoughts' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  }
};