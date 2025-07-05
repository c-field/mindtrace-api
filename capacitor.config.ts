import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mindtrace.app',
  appName: 'MindTrace',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
    cleartext: true
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
    captureInput: true
  }
};

export default config;
