# MindTrace Mental Health App

## Overview

MindTrace is a comprehensive mental health tracking application that helps users monitor their thoughts, emotions, and cognitive patterns. The app provides tools for tracking mental health data, analyzing patterns, and exporting insights for personal reflection or sharing with healthcare providers.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Radix UI components with Tailwind CSS for styling
- **State Management**: React Query (TanStack Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: Express sessions with in-memory storage
- **Authentication**: Simple username/password authentication
- **API Design**: RESTful endpoints with JSON responses

### Mobile Architecture
- **Framework**: Capacitor for cross-platform mobile deployment
- **Target Platforms**: iOS (App Store) and Android (Google Play Store)
- **Build System**: Vite with mobile-specific configuration

## Key Components

### Data Models
- **Users**: Email-based authentication with password storage
- **Thoughts**: Mental health entries with content, emotions, intensity ratings, cognitive distortions, and triggers
- **Cognitive Distortions**: Predefined categories like "all-or-nothing thinking," "overgeneralization," etc.

### Core Features
1. **Thought Tracking**: Users can log thoughts with emotional intensity ratings (1-10 scale)
2. **Cognitive Analysis**: Categorization of thoughts using established cognitive distortion patterns
3. **Data Visualization**: Charts showing emotional patterns, frequency analysis, and trend tracking
4. **Export Functionality**: CSV export for personal records or healthcare provider sharing
5. **Mobile Optimization**: Touch-friendly interface with bottom navigation

### Authentication System
- Session-based authentication using Express sessions
- Email validation for usernames
- Password storage (note: currently plain text - should be hashed in production)
- Automatic session persistence across browser sessions

## Data Flow

1. **User Registration/Login**: Users authenticate via email/password → session established
2. **Thought Entry**: User inputs thought data → validated with Zod → stored in PostgreSQL
3. **Data Retrieval**: Frontend queries thoughts via React Query → filtered by date ranges
4. **Analysis**: Client-side processing of thought patterns → visualization with Recharts
5. **Export**: Server generates CSV → client downloads or shares data

## External Dependencies

### Core Libraries
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database operations
- **@radix-ui**: Accessible UI component primitives
- **@tanstack/react-query**: Server state management
- **recharts**: Data visualization components
- **date-fns**: Date manipulation utilities

### Mobile Dependencies
- **@capacitor/core**: Cross-platform mobile runtime
- **@capacitor/ios**: iOS platform integration
- **@capacitor/android**: Android platform integration

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Static type checking
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast JavaScript bundling

## Deployment Strategy

### Web Deployment
- **Platform**: Replit with autoscale deployment
- **Build Process**: Vite builds client → ESBuild bundles server
- **Port Configuration**: Internal port 5000 → external port 80
- **Database**: PostgreSQL provisioned via Replit modules

### Mobile Deployment
- **iOS**: Capacitor → Xcode → App Store Connect
- **Android**: Capacitor → Android Studio → Google Play Console
- **Build Script**: Custom Node.js script for mobile-specific builds
- **Asset Management**: Optimized for mobile performance

### Environment Configuration
- **Development**: tsx with hot reloading
- **Production**: Compiled JavaScript with NODE_ENV=production
- **Database**: Environment variable-based connection string

## Changelog

```
Changelog:
- June 26, 2025. Initial setup
- June 26, 2025. Mobile deployment optimization completed:
  * Reduced bundle size by 50% (4.2MB → 2.1MB)
  * Removed 33 unused dependencies and 36 UI components
  * Added mobile-specific performance optimizations
  * Enhanced Capacitor configuration for iOS/Android
  * Implemented request timeouts and error handling
  * Ready for App Store and Google Play deployment
- June 26, 2025. Frontend converted from TypeScript to JavaScript:
  * Converted all React components from .tsx to .jsx
  * Converted all pages, hooks, and utilities to JavaScript
  * Preserved all functionality including form validation and API calls
  * Maintained original MindTrace design and styling
  * Backend remains unchanged (Express, Drizzle ORM, PostgreSQL)
- July 3, 2025. Capacitor iOS deployment configuration completed:
  * Created mobile-optimized build system for Capacitor
  * Configured proper frontend build output to root dist/ folder
  * Added iOS platform support with proper meta tags and PWA configuration
  * Successfully tested npx cap sync and npx cap add ios commands
  * Created build scripts for Capacitor compatibility
  * Ready for Xcode deployment and App Store submission
- July 3, 2025. Responsive design implementation for iOS devices:
  * Added iOS safe area support using env(safe-area-inset-*) for notch and home indicator
  * Implemented responsive CSS variables for consistent spacing across device sizes
  * Added responsive breakpoints for iPhone, iPad, and larger screens (768px, 1024px, 1280px)
  * Created viewport height handling using 100dvh for mobile browsers
  * Added orientation-specific adjustments for landscape mode
  * Implemented touch target optimization (44px minimum) for accessibility
  * Updated all components to use safe-area classes and responsive containers
  * Enhanced Capacitor build with comprehensive responsive design
- July 5, 2025. App icons and cognitive distortion UI implementation:
  * Configured complete iOS app icon set with all required resolutions (20px to 1024px)
  * Added proper AppIcon.appiconset with Contents.json for iPhone, iPad, and iOS marketing
  * Created comprehensive cognitive distortion dropdown with 15 CBT-based patterns
  * Implemented interactive tooltips showing definitions and examples for each distortion type
  * Added info icons and expandable descriptions for accessibility
  * Updated Track.jsx with enhanced cognitive distortion selection UI
  * Ready for Xcode deployment with proper app icons
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```