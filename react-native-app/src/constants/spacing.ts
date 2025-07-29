export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
  '6xl': 80,
} as const;

export const BORDER_RADIUS = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

export const DIMENSIONS = {
  // Touch targets
  touchTarget: 44,
  buttonHeight: 52,
  inputHeight: 48,
  
  // Navigation
  tabBarHeight: 60,
  headerHeight: 60,
  
  // Common sizes
  iconSm: 16,
  iconBase: 20,
  iconLg: 24,
  iconXl: 32,
} as const;