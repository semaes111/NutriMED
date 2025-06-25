# Dietary Consultation System

## Overview

This is a full-stack web application for dietary consultation management built for Dr. Sergio Martínez Conde's medical practice. The system provides patients with temporary access codes to view personalized dietary plans and meal recommendations based on their assigned diet level.

The application follows a monorepo structure with a React frontend, Express.js backend, and PostgreSQL database, all configured to run seamlessly in the Replit environment.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with custom medical theme variables
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **State Management**: TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Session Management**: Express sessions with PostgreSQL store
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful endpoints with JSON responses
- **Development**: TSX for TypeScript execution in development

### Database Architecture
- **Database**: PostgreSQL 16 (Neon serverless)
- **Schema Management**: Drizzle migrations
- **Connection**: Connection pooling with @neondatabase/serverless
- **Tables**:
  - `patients`: User accounts with access codes, diet levels, and medical data
  - `professionals`: Medical staff with unique access codes for patient management
  - `weight_records`: Patient weight tracking with timestamps and notes
  - `diet_levels`: Available diet configurations (levels 1-5)
  - `meal_plans`: Meal options categorized by type and diet level
  - `recipes`: Cooking instructions linked to meal plans
  - `food_items`: Individual food items with diet level restrictions
  - `intermittent_fasting`: Fasting schedules for patients

## Key Components

### Authentication System
- **Replit Auth Integration**: Secure OpenID Connect authentication via Replit
- **Access Code Validation**: Time-limited codes (30 days) for patient access
- **Session Management**: Server-side sessions stored in PostgreSQL
- **User Linking**: Authenticated users can link their patient access codes
- **Automatic Expiration**: Codes expire based on timestamp validation
- **Security**: OAuth2/OpenID Connect with refresh token support

### Professional Management System
- **Professional Dashboard**: Comprehensive patient management interface
- **Unique Access Codes**: Auto-generated codes for new patient registration
- **Nutritional Plan Assignment**: Direct diet level assignment with 30-day validity
- **Weight Tracking**: Real-time weight recording with evolution graphs
- **Patient Analytics**: Visual progress monitoring with Recharts integration

### Diet Management
- **Multi-Level System**: 5 diet levels with increasing restrictions
- **Meal Categories**: Breakfast, snack, lunch, dinner with specific guidelines
- **Glycemic Index**: Low, intermediate, high classifications
- **Food Categorization**: Beverages, breads, proteins, fruits, vegetables, cereals

### User Interface
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Medical Theme**: Custom color palette for healthcare applications
- **Component Library**: Consistent UI with shadcn/ui components
- **Interactive Elements**: Cards, badges, buttons optimized for medical data
- **Accessibility**: ARIA labels and keyboard navigation support

### Data Storage Strategy
- **Relational Model**: Normalized database schema with foreign key relationships
- **JSON Fields**: Flexible storage for arrays (ingredients, instructions, food lists)
- **Type Safety**: Drizzle-zod integration for runtime type validation
- **Migration System**: Version-controlled database schema changes

## Data Flow

### Patient Authentication Flow
1. Patient enters access code on login page
2. Backend validates code against database and checks expiration
3. If valid, session is created and patient redirected to dashboard
4. Session persists for the duration of the access period

### Diet Information Retrieval
1. Dashboard loads patient's current diet level from session
2. Frontend queries meal plans for the assigned diet level
3. Food items and recipes are fetched based on meal plan associations
4. Data is cached using TanStack Query for performance

### Content Management
1. Medical staff can manage diet levels, meal plans, and food items
2. Changes are immediately reflected for all patients on that diet level
3. Recipes and food restrictions are dynamically loaded based on patient assignments

## External Dependencies

### Core Runtime Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database ORM with PostgreSQL dialect
- **express**: Web application framework for Node.js
- **react**: Frontend UI library with hooks
- **@tanstack/react-query**: Server state management and caching

### UI and Styling Dependencies
- **@radix-ui**: Unstyled, accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Utility for conditional CSS classes
- **lucide-react**: Modern icon library

### Development Dependencies
- **typescript**: Static type checking
- **vite**: Fast build tool and development server
- **tsx**: TypeScript execution for Node.js
- **drizzle-kit**: Database migration and schema management

### Session and Form Dependencies
- **connect-pg-simple**: PostgreSQL session store for Express
- **react-hook-form**: Performant forms with validation
- **@hookform/resolvers**: Form validation resolver for Zod
- **zod**: TypeScript-first schema validation

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20 with Nix package management
- **Database**: PostgreSQL 16 automatically provisioned
- **Port Configuration**: Application runs on port 5000, exposed as port 80
- **Hot Reload**: Vite HMR for frontend, nodemon equivalent for backend

### Production Build Process
1. **Frontend Build**: Vite compiles React application to static assets
2. **Backend Build**: esbuild bundles Express server for production
3. **Asset Serving**: Express serves static files from dist/public
4. **Database Migrations**: Drizzle migrations applied during deployment

### Environment Configuration
- **DATABASE_URL**: Automatically configured by Replit PostgreSQL addon
- **NODE_ENV**: Set to production for optimized builds
- **Session Secret**: Generated securely for production deployments

### Scaling Considerations
- **Autoscale Deployment**: Configured for automatic scaling based on demand
- **Connection Pooling**: Neon serverless handles connection management
- **Static Asset Caching**: Built assets cached for performance
- **Session Persistence**: PostgreSQL-backed sessions survive server restarts

## Changelog

- June 24, 2025. Initial setup
- June 24, 2025. Added Replit Auth integration for secure user authentication
- June 24, 2025. Added professional dashboard with patient management, unique access codes, nutritional plan assignment, and weight tracking with evolution graphs
- June 24, 2025. Fixed professional code validation system (PROF2025) with separate access page and database schema corrections
- June 24, 2025. Implemented patient login system with access codes as main entry point to application
- June 24, 2025. Added session timer countdown for temporary access with real-time expiration warnings and automatic logout
- June 24, 2025. Fixed weight history graph display - now correctly shows weight records with dates and times, properly generates new access codes on weight registration
- June 24, 2025. Configured professional logout to redirect to Replit home page (/) for proper session termination
- June 24, 2025. Added editable target weight system for professionals - clickable interface with modal forms and real-time updates
- June 24, 2025. Integrated media mañana/mid-morning snack options within breakfast plans for unified meal planning experience
- June 25, 2025. Implemented harmonic color scheme for snack page with three distinct categories: Permitidos (emerald green), Completa (blue), and Simplificada (violet) for better visual organization and user experience
- June 25, 2025. Added Contextual Nutritional Tip Generator with playful animations featuring contextual tips based on diet level, time of day, meal context, and weight progress with smooth animations, shimmer effects, progress indicators, and auto-refresh functionality across dashboard, meal planning, and intermittent fasting pages
- June 25, 2025. Enhanced user interface with emojis at the beginning of each food line across all meal plans, recipes, and nutritional tips for improved visual appeal and better user experience
- June 25, 2025. Implemented Wellness Mood Tracker with Playful Motivational Animations: comprehensive mood tracking system with 1-5 scale ratings for mood, energy, and motivation levels; interactive emoji-based interface with smooth animations; predefined emotion tags; notes functionality; historical data visualization with charts and trends; motivational messages based on scores; PostgreSQL mood_entries table integration; professional dashboard access to patient mood data
- June 25, 2025. FIXED Professional Panel Access System: corrected missing routes in App.tsx router, added proper useLocation imports, implemented window.location.href navigation fallback, enhanced localStorage session management, and resolved all authentication flow issues - professional dashboard now fully operational with code PROF2025
- June 25, 2025. RESTORED Complete Professional Dashboard Functionality: reinstated full professional panel with patient management, weight tracking, diet level assignment, analytics charts, patient search, access code generation, target weight management, and comprehensive patient data visualization - all features now operational
- June 25, 2025. IMPLEMENTED Advanced Professional Features: added diet level modification system with dropdown selector allowing professionals to change patient diet levels (1-5) with immediate database updates; integrated interactive weight evolution charts using Recharts with line graphs showing weight progression over time, tooltips, and recent records display; fixed weight history API integration for real-time chart updates after new weight registration with automatic code generation
- June 25, 2025. RESOLVED Data Synchronization Issues: fixed session-based authentication for patient dashboards with proper cookie configuration (secure=false in development, sameSite=lax); implemented enhanced 3D weight evolution chart with color-coded data points (green=improvement, red=setback, yellow=stable); corrected patient weight history API to show real-time data from professional panel; weight data now syncs correctly between professional and patient dashboards with 11 weight records displaying properly
- June 25, 2025. IMPLEMENTED Target Weight Modification System: added clickable target weight cards in professional dashboard with modal interface for easy editing; implemented PATCH API endpoint for target weight updates with validation (30-300 kg range); enhanced UI with visual indicators and current weight context; real-time updates to patient data with automatic refresh functionality
- June 25, 2025. REFINED 3D Weight Chart Animation: replaced pulse movement animations with subtle point size variations based on weight progress - larger points (r=10) for improvements, smaller points (r=7) for setbacks, normal points (r=8) for stable weight; added smooth transitions for elegant visual feedback without distracting movement; updated legend to reflect size-based visual coding system
- June 25, 2025. ENHANCED Weight Registration System: expanded weight validation range from 30-300kg to 10-500kg for realistic medical scenarios; improved new access code display with prominent toast notifications featuring copy-to-clipboard functionality; codes now show in highlighted boxes with 10-second duration; updated frontend validation schemas to match backend ranges; automatic patient data refresh with new access codes
- June 25, 2025. IMPLEMENTED Color-Coded Diet Level Indicators: added visual color differentiation for nutritional plan levels with 80% transparency - Level 1 (emerald green), Level 2 (blue), Level 3 (purple), Level 4 (orange), Level 5 (red) for improved visual identification and better user experience in patient dashboard
- June 25, 2025. ENHANCED Diet Level Card Background: implemented harmonious background colors with 70% transparency that match the circle colors for each nutritional plan level - creates cohesive visual identity and improved color-coded identification throughout the patient dashboard interface

## User Preferences

Preferred communication style: Simple, everyday language.