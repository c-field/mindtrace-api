/**
 * Error handling utilities
 */

export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
}

/**
 * Check if error is network related
 */
export const isNetworkError = (error: any): boolean => {
  return (
    error?.message?.includes('Network') ||
    error?.message?.includes('fetch') ||
    error?.code === 'NETWORK_ERROR' ||
    !navigator.onLine
  );
};

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.message) {
    if (isNetworkError(error)) {
      return 'Please check your internet connection and try again';
    }
    return error.message;
  }

  return 'Something went wrong. Please try again';
};

/**
 * Log error for debugging (development only)
 */
export const logError = (error: any, context?: string): void => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context || 'App Error'}]:`, error);
  }
};

/**
 * Create standardized error response
 */
export const createErrorResponse = (message: string, code?: string): AppError => {
  return {
    message,
    code,
  };
};