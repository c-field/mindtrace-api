export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface Thought {
  id: string;
  content: string;
  cognitive_distortion: string;
  intensity: number;
  trigger?: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateThoughtData {
  content: string;
  cognitiveDistortion: string;
  intensity: number;
  trigger?: string;
}

export interface CognitiveDistortion {
  id: string;
  name: string;
  description: string;
  example: string;
}

export interface AuthResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  MainTabs: undefined;
};

export type MainTabParamList = {
  Track: undefined;
  Analyze: undefined;
  Export: undefined;
  Profile: undefined;
};

export type TimeFilter = '7days' | '30days' | 'all';
export type ExportFormat = 'csv' | 'pdf';