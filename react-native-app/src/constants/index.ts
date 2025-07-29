export * from './colors';
export * from './typography';
export * from './spacing';

// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://11d3d8eb-500f-47e4-982c-6840c979c26a-00-29fzi9wm5gkmr.riker.replit.dev',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_EMAIL: 'userEmail',
} as const;

// Query Keys
export const QUERY_KEYS = {
  THOUGHTS: 'thoughts',
  USER_PROFILE: 'userProfile',
} as const;