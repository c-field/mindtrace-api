/**
 * Email validation utility
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Password validation utility
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

/**
 * Text content validation
 */
export const isValidContent = (content: string): boolean => {
  return content.trim().length > 0;
};

/**
 * Intensity level validation
 */
export const isValidIntensity = (intensity: number): boolean => {
  return Number.isInteger(intensity) && intensity >= 1 && intensity <= 10;
};

/**
 * Form validation errors
 */
export interface ValidationErrors {
  email?: string;
  password?: string;
  content?: string;
  cognitiveDistortion?: string;
}

/**
 * Validate authentication form
 */
export const validateAuthForm = (email: string, password: string): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!email.trim()) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (!isValidPassword(password)) {
    errors.password = 'Password must be at least 6 characters';
  }

  return errors;
};

/**
 * Validate thought form
 */
export const validateThoughtForm = (
  content: string,
  cognitiveDistortion: string,
  intensity: number
): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!isValidContent(content)) {
    errors.content = 'Please enter your thought';
  }

  if (!cognitiveDistortion) {
    errors.cognitiveDistortion = 'Please select a cognitive distortion';
  }

  return errors;
};