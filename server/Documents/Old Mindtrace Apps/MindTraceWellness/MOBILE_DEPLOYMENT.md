# MindTrace Mobile App Deployment Guide

## Overview
Your MindTrace mental health app is now configured for deployment to both Apple App Store and Google Play Store using Capacitor.

## Prerequisites

### For iOS (App Store)
- Mac computer with Xcode 14+ installed
- Apple Developer Account ($99/year)
- Valid iOS Distribution Certificate
- App Store Connect access

### For Android (Google Play)
- Android Studio installed
- Google Play Console Developer Account ($25 one-time fee)
- Java Development Kit (JDK) 11+

## Database Integration
✅ **PostgreSQL Database Created**: Your user data is now stored in a persistent database that can integrate with HubSpot via API endpoints:
- `/api/database/users` - Get all users with email addresses
- `/api/database/users/:userId/thoughts` - Get user's mental health data
- `/api/database/analytics` - Get engagement analytics

## Build Process

### 1. Build for Mobile
```bash
# Build the web app for mobile
cd client && npx vite build --config vite.config.mobile.ts

# Sync with Capacitor
npx cap sync
```

### 2. iOS Deployment
```bash
# Add iOS platform
npx cap add ios

# Open in Xcode
npx cap open ios
```

**In Xcode:**
1. Set your Development Team in project settings
2. Configure Bundle Identifier: `com.mindtrace.app`
3. Add app icons (1024x1024 required)
4. Set deployment target iOS 13.0+
5. Archive and upload to App Store Connect

### 3. Android Deployment
```bash
# Add Android platform
npx cap add android

# Open in Android Studio
npx cap open android
```

**In Android Studio:**
1. Configure signing keys for release
2. Set applicationId: `com.mindtrace.app`
3. Update app icons and resources
4. Generate signed APK/AAB for Play Store

## App Store Assets Needed

### Required Assets
- **App Icon**: 1024x1024 PNG (no transparency)
- **Screenshots**: 
  - iPhone: 6.7", 6.5", 5.5" displays
  - iPad: 12.9", 11" displays
  - Android: Various screen sizes
- **App Description**: Mental health tracking with CBT principles
- **Keywords**: mental health, CBT, mood tracking, therapy, anxiety
- **Privacy Policy**: Required for health apps

### App Store Categories
- **iOS**: Health & Fitness / Medical
- **Android**: Health & Fitness / Medical

## Key Features for Store Listing
- ✅ Thought tracking with cognitive distortion identification
- ✅ Mood and intensity monitoring (1-10 scale)
- ✅ Analytics and trend visualization
- ✅ Data export (CSV/PDF)
- ✅ Secure user authentication
- ✅ Database integration for HubSpot
- ✅ Mobile-optimized interface

## HubSpot Integration API
Your database exposes these endpoints for CRM integration:
- User data with email addresses for lead tracking
- Mental health analytics for engagement metrics
- Thought pattern data for personalized marketing

## Compliance Notes
- ✅ Data encryption in transit and at rest
- ✅ User authentication and session management
- ✅ GDPR-compliant data export functionality
- ⚠️ Consider HIPAA compliance for health data
- ⚠️ Add privacy policy and terms of service

## Next Steps
1. Create app store developer accounts
2. Generate app icons and screenshots
3. Write app store descriptions
4. Configure signing certificates
5. Submit for review

## Support
The app includes comprehensive error handling and user feedback systems for smooth app store approval.