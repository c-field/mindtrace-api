import { format, subDays, parseISO, isValid } from 'date-fns';

/**
 * Format date for display
 */
export const formatDisplayDate = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) {
      return 'Invalid date';
    }
    return format(dateObj, 'MMM dd, yyyy');
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Format date for API requests
 */
export const formatApiDate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

/**
 * Get date range for quick filters
 */
export const getDateRange = (days: number): { from: Date; to: Date } => {
  const now = new Date();
  return {
    from: subDays(now, days),
    to: now,
  };
};

/**
 * Format date range for API
 */
export const formatDateRangeForApi = (from: Date, to: Date) => {
  return {
    dateFrom: format(from, 'yyyy-MM-dd') + 'T00:00:00.000Z',
    dateTo: format(to, 'yyyy-MM-dd') + 'T23:59:59.999Z',
  };
};

/**
 * Safe date parsing with fallback
 */
export const safeParseDate = (dateString: string): Date | null => {
  try {
    const parsed = parseISO(dateString);
    return isValid(parsed) ? parsed : null;
  } catch (error) {
    return null;
  }
};