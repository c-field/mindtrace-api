export const COLORS = {
  // Primary palette
  primary: '#00D4AA',
  primaryLight: '#33E0BB',
  primaryDark: '#00A588',
  
  // Grayscale
  background: '#1F2937',
  surface: '#374151',
  card: '#4B5563',
  
  // Text colors
  textPrimary: '#F3F4F6',
  textSecondary: '#D1D5DB',
  textTertiary: '#9CA3AF',
  textDisabled: '#6B7280',
  
  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Interactive elements
  border: '#4B5563',
  borderActive: '#00D4AA',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // White/Black
  white: '#FFFFFF',
  black: '#000000',
} as const;

export type ColorKey = keyof typeof COLORS;