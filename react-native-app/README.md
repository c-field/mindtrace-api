# MindTrace React Native App

A native mobile version of the MindTrace mental health tracking application built with React Native.

## Features

- **Native Authentication**: Secure login and registration with session management
- **Thought Tracking**: Record thoughts with cognitive distortion categorization
- **Data Analytics**: Visualize mental health patterns with native charts
- **Data Export**: Export data as CSV with native sharing capabilities
- **Profile Management**: User profile and account management
- **Offline Support**: Local data caching with AsyncStorage

## Technology Stack

- **React Native**: Cross-platform mobile development
- **TypeScript**: Type-safe development
- **React Navigation**: Native navigation patterns
- **React Query**: Server state management and caching
- **React Native Chart Kit**: Data visualization
- **AsyncStorage**: Local data persistence
- **React Hook Form**: Form management and validation
- **Zod**: Runtime type validation

## Project Structure

```
react-native-app/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/            # App screens/pages
│   ├── services/           # API and external services
│   ├── data/              # Static data and types
│   └── types/             # TypeScript type definitions
├── android/               # Android-specific code
├── ios/                   # iOS-specific code
└── App.tsx               # Main app component
```

## Development Setup

### Prerequisites

- Node.js (v18 or higher)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. Install dependencies:
```bash
cd react-native-app
npm install
```

2. Install iOS pods (iOS only):
```bash
cd ios && pod install && cd ..
```

### Running the App

#### Android
```bash
npm run android
```

#### iOS
```bash
npm run ios
```

#### Start Metro bundler
```bash
npm start
```

## Building for Production

### Android
```bash
npm run build:android
```

### iOS
```bash
npm run build:ios
```

## Key Differences from Web Version

### Navigation
- Uses React Navigation instead of Wouter
- Bottom tab navigation for main screens
- Stack navigation for auth flow

### UI Components
- Native components instead of web DOM elements
- Platform-specific styling and behavior
- Touch-friendly interactions and gestures

### Data Storage
- AsyncStorage for local persistence
- Native file system access for exports
- Platform-specific sharing capabilities

### Performance
- Native rendering for better performance
- Optimized image and asset loading
- Memory-efficient list rendering

## API Integration

The app connects to the existing Express.js backend:
- Authentication endpoints
- Thought CRUD operations
- Data export functionality
- Real-time data synchronization

## Mobile-Specific Features

### iOS
- Safe area handling for notch and home indicator
- Native iOS design patterns
- App Store submission ready

### Android
- Material Design components
- Google Play Store submission ready
- Adaptive icons and splash screens

## Configuration

### Environment Variables
Create a `.env` file in the root directory:
```
API_BASE_URL=your_backend_url
```

### Build Configuration
- Update `app.json` for app metadata
- Configure signing certificates for production builds
- Set up proper bundle IDs and app names

## Deployment

### iOS App Store
1. Build release version in Xcode
2. Archive and submit to App Store Connect
3. Complete App Store review process

### Google Play Store
1. Build signed APK or AAB
2. Upload to Google Play Console
3. Complete Play Store review process

## Testing

Run tests with:
```bash
npm test
```

## Contributing

1. Follow TypeScript best practices
2. Use consistent naming conventions
3. Add proper error handling
4. Write comprehensive tests
5. Update documentation

## License

This project is part of the MindTrace mental health application suite.