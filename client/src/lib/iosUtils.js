// iOS-specific utilities for proper safe area handling
export function initializeSafeArea() {
  // Detect and handle safe area support
  function updateSafeArea() {
    const safeAreaTop = CSS.supports('padding-top', 'env(safe-area-inset-top)');
    
    if (!safeAreaTop) {
      // Fallback for browsers that don't support env()
      document.documentElement.style.setProperty('--safe-area-top', '44px');
      document.documentElement.style.setProperty('--safe-area-bottom', '0px');
      document.documentElement.style.setProperty('--safe-area-left', '0px');
      document.documentElement.style.setProperty('--safe-area-right', '0px');
    }
    
    // Calculate header padding
    const headerPaddingTop = safeAreaTop ? 'calc(var(--safe-area-top) + 16px)' : '60px';
    document.documentElement.style.setProperty('--header-padding-top', headerPaddingTop);
  }
  
  // Run on load and orientation change
  updateSafeArea();
  window.addEventListener('orientationchange', updateSafeArea);
  window.addEventListener('resize', updateSafeArea);
}

// Debug utilities for iOS testing
export function addDebugInfo() {
  if (process.env.NODE_ENV === 'development') {
    const header = document.querySelector('.compact-header');
    if (header) {
      header.classList.add('debug');
      
      // Add debug info
      const safeAreaTop = getComputedStyle(document.documentElement).getPropertyValue('--safe-area-top');
      header.setAttribute('data-safe-top', safeAreaTop);
    }
  }
}

// Detect iOS device type
export function detectIOSDevice() {
  const userAgent = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isStandalone = window.navigator.standalone;
  const isCapacitor = window.Capacitor;
  
  return {
    isIOS,
    isStandalone,
    isCapacitor,
    deviceType: getDeviceType()
  };
}

function getDeviceType() {
  const { innerWidth, innerHeight } = window;
  const maxDimension = Math.max(innerWidth, innerHeight);
  const minDimension = Math.min(innerWidth, innerHeight);
  
  // iPhone classifications
  if (maxDimension <= 568) return 'iPhone SE (1st gen)';
  if (maxDimension <= 667) return 'iPhone SE (2nd/3rd gen)';
  if (maxDimension <= 736) return 'iPhone 8 Plus';
  if (maxDimension <= 812 && minDimension <= 375) return 'iPhone 13 mini';
  if (maxDimension <= 844) return 'iPhone 14';
  if (maxDimension <= 852) return 'iPhone 14 Pro';
  if (maxDimension <= 926) return 'iPhone 14 Plus';
  if (maxDimension <= 932) return 'iPhone 14 Pro Max';
  
  return 'Unknown iOS device';
}

// Log device info for debugging
export function logDeviceInfo() {
  const deviceInfo = detectIOSDevice();
  console.log('🔍 iOS Device Detection:', deviceInfo);
  
  const safeAreaValues = {
    top: getComputedStyle(document.documentElement).getPropertyValue('--safe-area-top'),
    bottom: getComputedStyle(document.documentElement).getPropertyValue('--safe-area-bottom'),
    left: getComputedStyle(document.documentElement).getPropertyValue('--safe-area-left'),
    right: getComputedStyle(document.documentElement).getPropertyValue('--safe-area-right')
  };
  
  console.log('📱 Safe Area Values:', safeAreaValues);
  
  const headerPadding = getComputedStyle(document.documentElement).getPropertyValue('--header-padding-top');
  console.log('🎨 Header Padding:', headerPadding);
}