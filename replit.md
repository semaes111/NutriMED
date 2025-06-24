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

## User Preferences

Preferred communication style: Simple, everyday language.