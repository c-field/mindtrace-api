import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mindtrace.app',
  appName: 'MindTrace',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
    cleartext: true,
    // Add these network settings
    allowNavigation: [
      "https://11d3d8eb-500f-47e4-982c-6840c979c26a-00-29fzi9wm5gkmr.riker.replit.dev",
      "https://*.replit.dev",
      "https://*.supabase.co"
    ]
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#374151",
      showSpinner: false,
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#374151"
    },
    Keyboard: {
      resize: "body",
      style: "dark",
      resizeOnFullScreen: true
    },
    App: {
      launchUrl: ""
    },
    // Add HTTP plugin configuration
    CapacitorHttp: {
      enabled: true
    }
  },
  ios: {
    contentInset: "automatic",
    scrollEnabled: true,
    backgroundColor: "#374151"
  },
  android: {
    backgroundColor: "#374151",
    allowMixedContent: true,
    captureInput: true,
    // Add network security config
    usesCleartextTraffic: true
  }
};

export default config;