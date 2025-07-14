// Navigation utility functions to ensure consistent scroll-to-top behavior

/**
 * Scroll to top of page with smooth animation
 */
export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Scroll to top with instant scroll (no animation)
 */
export function scrollToTopInstant() {
  window.scrollTo(0, 0);
}

/**
 * Enhanced navigation with scroll reset
 * @param {Function} navigateFunction - The navigation function to call
 * @param {*} args - Arguments to pass to the navigation function
 * @param {number} delay - Delay in ms before scrolling (default: 0)
 */
export function navigateWithScrollReset(navigateFunction, args = [], delay = 0) {
  // Execute navigation
  if (typeof navigateFunction === 'function') {
    navigateFunction(...args);
  }
  
  // Reset scroll position after navigation
  if (delay > 0) {
    setTimeout(() => {
      scrollToTop();
    }, delay);
  } else {
    scrollToTop();
  }
}

/**
 * Enhanced back navigation with scroll reset
 */
export function goBackWithScrollReset() {
  window.history.back();
  // Use setTimeout to ensure scroll happens after navigation
  setTimeout(() => {
    scrollToTop();
  }, 100);
}

/**
 * Enhanced forward navigation with scroll reset
 */
export function goForwardWithScrollReset() {
  window.history.forward();
  // Use setTimeout to ensure scroll happens after navigation
  setTimeout(() => {
    scrollToTop();
  }, 100);
}

/**
 * Listen for browser back/forward navigation and reset scroll
 */
export function initializeNavigationScrollReset() {
  // Handle browser back/forward buttons
  window.addEventListener('popstate', (event) => {
    // Small delay to ensure DOM has updated
    setTimeout(() => {
      scrollToTop();
    }, 50);
  });
  
  // Handle page reload
  window.addEventListener('beforeunload', () => {
    // Save scroll position to reset on reload
    sessionStorage.setItem('scrollPosition', '0');
  });
  
  // Reset scroll on page load
  window.addEventListener('load', () => {
    const savedPosition = sessionStorage.getItem('scrollPosition');
    if (savedPosition === '0') {
      scrollToTopInstant();
    }
    sessionStorage.removeItem('scrollPosition');
  });
}

/**
 * Reset scroll position for form submissions and mutations
 */
export function resetScrollOnAction(callback) {
  return async (...args) => {
    const result = await callback(...args);
    scrollToTop();
    return result;
  };
}