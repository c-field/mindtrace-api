# MindTrace React Native App

A complete React Native conversion of the MindTrace mental health web application, providing a truly native mobile experience while maintaining all functionality.

## 🚀 Project Structure

This is a **complete React Native project** with proper iOS and Android native files:

```
react-native-app/
├── ios/                          # iOS native project files
│   ├── MindTrace/               # iOS app bundle
│   │   ├── Info.plist          # iOS app configuration
│   │   ├── AppDelegate.h/mm    # iOS app delegate
│   │   ├── main.m              # iOS entry point
│   │   └── LaunchScreen.storyboard
│   ├── MindTrace.xcodeproj/    # Xcode project
│   ├── MindTrace.xcworkspace/  # Xcode workspace
│   └── Podfile                 # CocoaPods dependencies
├── android/                     # Android native project files
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml
│   │   │   └── java/com/mindtrace/
│   │   │       ├── MainActivity.kt
│   │   │       └── MainApplication.kt
│   │   └── build.gradle
│   └── build.gradle
├── src/                        # React Native source code
│   ├── screens/               # App screens (Track, Analyze, Export, Profile)
│   ├── components/            # Reusable components
│   ├── services/              # API services
│   └── data/                  # Static data
├── App.tsx                    # Main app component
├── index.js                   # App entry point
├── package.json              # Dependencies
├── babel.config.js           # Babel configuration
├── metro.config.js           # Metro bundler config
└── tsconfig.json             # TypeScript config
```

## 🎯 Features Implemented

### ✅ Native Authentication
- Secure login/registration with AsyncStorage session management
- Token-based authentication with backend verification
- Auto-login on app restart

### ✅ Complete Screen Conversion
- **TrackScreen**: Native thought recording with cognitive distortion picker and custom slider
- **AnalyzeScreen**: Data visualization with React Native Chart Kit
- **ExportScreen**: File system access with native sharing capabilities  
- **ProfileScreen**: User management with journey statistics

### ✅ Mobile-Optimized UX
- React Navigation with bottom tabs and stack navigation
- Native iOS and Android design patterns
- Touch-friendly interactions and gestures
- Platform-specific styling and behavior
- Safe area handling for modern devices

### ✅ Backend Integration
- Full API connectivity to existing Express.js backend
- Real-time data synchronization with React Query
- Comprehensive error handling and offline support
- Authentication middleware and token management

### ✅ Native Dependencies
- **Navigation**: React Navigation 6 with bottom tabs
- **Charts**: React Native Chart Kit for data visualization
- **Storage**: AsyncStorage for local data persistence
- **Icons**: React Native Vector Icons with Ionicons
- **Forms**: React Hook Form with validation
- **File System**: React Native FS for export functionality
- **Sharing**: React Native Share for native file sharing

## 🛠 Development Setup

### Prerequisites
- Node.js 18+
- React Native CLI: `npm install -g react-native-cli`
- iOS: Xcode 12+ and CocoaPods
- Android: Android Studio and Java 17+

### Installation
```bash
# Navigate to React Native project
cd react-native-app

# Install dependencies  
npm install

# iOS setup (macOS only)
cd ios && pod install && cd ..

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

### Building for Production
```bash
# iOS build
npm run build:ios

# Android build  
npm run build:android
```

## 📱 Native Features

### iOS Integration
- Proper iOS app bundle configuration
- Xcode project and workspace files
- CocoaPods dependency management
- iOS-specific styling and interactions
- App Store deployment ready

### Android Integration
- Complete Android project structure
- Gradle build configuration
- Kotlin-based Activity and Application classes
- Android-specific permissions and configurations
- Google Play Store deployment ready

## 🔗 Backend Connectivity

The app connects to the existing MindTrace backend at:
- **Development**: `https://11d3d8eb-500f-47e4-982c-6840c979c26a-00-29fzi9wm5gkmr.riker.replit.dev`
- **API Endpoints**: `/api/auth/login`, `/api/thoughts`, `/api/export/csv`
- **Authentication**: Session-based with AsyncStorage token management

## 🎨 Design System

### Color Palette
- **Primary**: #00D4AA (Teal) - Action buttons and highlights
- **Background**: #1F2937 (Dark Gray) - Main background
- **Cards**: #374151 (Medium Gray) - Content containers
- **Text Primary**: #F3F4F6 (Light Gray) - Main text
- **Text Secondary**: #9CA3AF (Gray) - Supporting text

### Typography
- **Headers**: System font, bold, 24px+
- **Body**: System font, regular, 16px
- **Labels**: System font, medium, 14px
- **iOS**: -apple-system, BlinkMacSystemFont
- **Android**: Roboto, system default

## 🚀 Deployment Ready

This React Native project is **complete and ready for deployment**:

1. **iOS App Store**: Open `ios/MindTrace.xcworkspace` in Xcode
2. **Google Play Store**: Build with `./gradlew assembleRelease` in Android Studio
3. **Feature Parity**: All web app functionality converted to native
4. **Production Build**: Optimized for performance and app store guidelines

## 📊 Technical Architecture

- **Framework**: React Native 0.75+ with TypeScript
- **Navigation**: React Navigation 6 with type safety
- **State Management**: React Query for server state, AsyncStorage for local state
- **Styling**: StyleSheet API with platform-specific styling
- **Data Flow**: RESTful API → React Query → Native UI components
- **Performance**: Native modules, lazy loading, and optimized renders

The app provides a truly native mobile experience while maintaining full feature parity with the original web application.