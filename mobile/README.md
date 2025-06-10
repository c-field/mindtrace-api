# MindTrace Mobile - Expo React Native App

This is the Expo React Native version of MindTrace, a mental health support app for tracking and analyzing negative thought patterns with cognitive distortion categorization.

## Prerequisites

- Node.js (v16 or later)
- Expo CLI
- iOS Simulator (for iOS development) or Android Studio (for Android development)

## Setup Instructions

1. **Install Expo CLI globally:**
   ```bash
   npm install -g @expo/cli
   ```

2. **Navigate to the mobile directory:**
   ```bash
   cd mobile
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Update API configuration:**
   - Open `src/screens/AuthScreen.js`, `TrackScreen.js`, `AnalyzeScreen.js`, `ExportScreen.js`, and `ProfileScreen.js`
   - Update the `API_BASE_URL` constant to point to your backend server
   - For local development: `http://localhost:5000`
   - For production: Replace with your actual server URL

5. **Start the development server:**
   ```bash
   npm start
   ```

6. **Run on your device:**
   - **iOS Simulator:** Press `i` in the terminal or run `npm run ios`
   - **Android Emulator:** Press `a` in the terminal or run `npm run android`
   - **Physical Device:** Download the Expo Go app and scan the QR code

## Features

### Authentication
- Email-based user registration and login
- Secure session management with AsyncStorage
- Loading screen with animated MindTrace logo

### Thought Tracking
- Record negative thoughts with detailed information
- Select primary emotions from predefined list
- Rate intensity levels from 1-10
- Identify cognitive distortions using CBT principles
- Optional trigger identification

### Analytics
- View thought patterns over different time periods
- Track average intensity levels
- Identify most common emotions and cognitive distortions
- Recent thoughts history with full details

### Data Export
- Export thought data to CSV format
- Date range filtering for exports
- Share functionality using device's native sharing

### Profile Management
- View and edit profile information
- Logout functionality
- Clear all data option
- Mental health resources with direct contact links

## API Integration

The app connects to your MindTrace backend server for:
- User authentication and session management
- Thought data storage and retrieval
- Analytics data processing
- CSV export generation

Ensure your backend server is running and accessible from your mobile device.

## Configuration

### Backend URL
Update the `API_BASE_URL` in each screen file to match your backend deployment:

```javascript
const API_BASE_URL = 'https://your-server-domain.com'; // Replace with your actual URL
```

### Expo Configuration
The app is configured in `app.json` with:
- App name: MindTrace
- Orientation: Portrait only
- Platform support: iOS, Android, and Web

## Development

### Project Structure
```
mobile/
├── App.js                 # Main app component with navigation
├── app.json              # Expo configuration
├── package.json          # Dependencies and scripts
├── babel.config.js       # Babel configuration
└── src/
    └── screens/
        ├── LoadingScreen.js    # Initial loading screen
        ├── AuthScreen.js       # Login/signup screen
        ├── TrackScreen.js      # Thought tracking form
        ├── AnalyzeScreen.js    # Analytics and patterns
        ├── ExportScreen.js     # Data export functionality
        └── ProfileScreen.js    # User profile and settings
```

### Key Dependencies
- **Expo**: React Native framework
- **React Navigation**: Tab and stack navigation
- **AsyncStorage**: Local data persistence
- **Expo Linear Gradient**: Beautiful gradient backgrounds
- **Vector Icons**: Ionicons for consistent UI
- **Date/Time Picker**: Native date selection

## Building for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

## Troubleshooting

### Common Issues

1. **Metro bundler issues**: Clear cache with `expo start -c`
2. **Dependency conflicts**: Delete `node_modules` and run `npm install` again
3. **Network requests failing**: Ensure backend server is running and URL is correct
4. **iOS simulator not starting**: Reset simulator or restart Xcode

### Network Configuration

For Android emulator, use `http://10.0.2.2:5000` as the API base URL instead of `localhost:5000`.

For physical devices, ensure your phone and development machine are on the same network, and use your computer's IP address.

## Support

For issues specific to the mobile app, check:
1. Expo documentation: https://docs.expo.dev/
2. React Navigation docs: https://reactnavigation.org/
3. React Native documentation: https://reactnative.dev/

The mobile app maintains feature parity with the web version while providing native mobile experience and offline-capable authentication.