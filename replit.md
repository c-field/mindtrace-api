# MindTrace - Mental Health Support Application

## Overview

MindTrace is a comprehensive mental health support application with both web and React Native mobile components. The application helps users track their thoughts, analyze cognitive patterns, and export data for mental health monitoring. It features a secure authentication system using Supabase, thought tracking with cognitive distortion analysis, and data visualization capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **Database**: Supabase (PostgreSQL with built-in authentication)
- **Session Management**: Express sessions with secure configuration
- **API Design**: RESTful API with proper error handling and rate limiting

### Frontend Architecture
- **Web**: Vite-based development with React integration (development/build setup)
- **Mobile**: Complete React Native application with native iOS/Android support
- **State Management**: React Query (TanStack Query) for server state management
- **Navigation**: React Navigation v6 with stack and tab navigation
- **Styling**: Custom design system with consistent colors, typography, and spacing

### Authentication Strategy
- **Provider**: Supabase Auth for secure user management
- **Session Storage**: Express sessions on backend, AsyncStorage on mobile
- **Security**: Secure HTTP-only cookies for web, token-based for mobile
- **Validation**: Zod schemas for input validation

## Key Components

### Database Schema (Supabase)
- **Users Table**: Stores user profiles with Supabase UUID as primary key
- **Thoughts Table**: Mental health entries with content, intensity, cognitive distortions, and timestamps
- **Authentication**: Handled entirely by Supabase Auth service

### API Endpoints
- **Authentication**: `/api/auth/signup`, `/api/auth/login`, `/api/auth/me`
- **Thoughts CRUD**: `/api/thoughts` with filtering by date ranges
- **Data Export**: `/api/export/csv` for CSV generation
- **Security**: Rate limiting on auth endpoints, session-based protection

### Mobile App Structure
- **Complete React Native App**: Native iOS/Android projects with proper build configurations
- **Screen Architecture**: Tab-based navigation with Track, Analyze, Export, and Profile screens
- **Component Library**: Reusable UI components with consistent design system
- **Services Layer**: API client with proper error handling and offline considerations

### Cognitive Distortion System
- **Predefined Categories**: 12+ common cognitive distortions with descriptions and examples
- **Tracking Integration**: Each thought entry is categorized by distortion type
- **Analysis Features**: Statistical analysis and visualization of distortion patterns

## Data Flow

### Thought Creation Flow
1. User inputs thought content and selects cognitive distortion
2. Frontend validates input using Zod schemas
3. API creates database entry with user association
4. React Query updates cache and refreshes UI
5. Success feedback provided to user

### Authentication Flow
1. User credentials sent to Supabase through backend proxy
2. Backend creates session and stores Supabase user ID
3. Mobile app stores authentication token in AsyncStorage
4. Protected routes check session/token validity
5. Auto-login on app restart using stored credentials

### Data Analysis Flow
1. Thoughts fetched with optional date range filtering
2. Client-side statistical processing for patterns
3. Chart data generation for intensity trends and distortion frequency
4. Real-time updates when new thoughts are added

## External Dependencies

### Backend Dependencies
- **Supabase**: Authentication and database services
- **Express**: Web framework with CORS and session middleware
- **Zod**: Schema validation and type safety
- **Development Tools**: TypeScript, TSX for development server, ESBuild for production

### Mobile Dependencies
- **React Native**: Cross-platform mobile framework
- **React Navigation**: Navigation library with stack and tab navigators
- **React Query**: Server state management and caching
- **Native Modules**: Vector icons, charts, file system, sharing capabilities
- **Date Handling**: date-fns for date manipulation and formatting

### Build Tools
- **Vite**: Development server and build tool for web components
- **Metro**: React Native bundler with custom configuration
- **TypeScript**: Type safety across the entire application
- **ESBuild**: Fast production builds for Node.js backend

## Deployment Strategy

### Backend Deployment
- **Environment**: Node.js production environment
- **Build Process**: TypeScript compilation with ESBuild bundling
- **Environment Variables**: Supabase URL and service role key required
- **Production Script**: `npm start` runs compiled JavaScript

### Mobile Deployment
- **Development**: Metro bundler with hot reloading
- **iOS Build**: Xcode project with proper provisioning profiles
- **Android Build**: Gradle build system with release configurations
- **Distribution**: Standard app store deployment process

### Database Management
- **Migrations**: Drizzle Kit for schema management (configured but using Supabase)
- **Environment Setup**: Supabase project configuration required
- **Data Backup**: Handled by Supabase infrastructure

### Security Considerations
- **API Security**: Rate limiting, input validation, secure session configuration
- **Mobile Security**: Secure token storage, certificate pinning considerations
- **Data Privacy**: User data isolation, secure authentication flows
- **Environment Variables**: Sensitive keys stored securely, not in repository

The application is designed to be production-ready with proper error handling, loading states, offline considerations (mobile), and a scalable architecture that can grow with user needs.