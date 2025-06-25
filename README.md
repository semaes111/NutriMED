# Project Title: Health & Wellness Planner (Suggestion - User can modify)

## Description

This is a full-stack web application designed to help users manage their health and wellness. It appears to include features for meal planning, tracking intermittent fasting, and monitoring mood. The application provides distinct interfaces for regular users and professionals.

## Tech Stack

**Frontend:**
*   React
*   Vite
*   TypeScript
*   Tailwind CSS
*   Shadcn/UI (Radix UI)
*   Wouter (for routing)
*   React Query (for data fetching and state management)

**Backend:**
*   Node.js
*   Express.js
*   TypeScript

**Database:**
*   PostgreSQL
*   Drizzle ORM

**Authentication:**
*   Passport.js (with local strategy and potentially Replit Auth)

## Getting Started

### Prerequisites

*   Node.js (version specified in `.nvmrc` or a recent LTS version)
*   npm (comes with Node.js)
*   Access to a PostgreSQL database

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root directory and configure your database connection string and any other necessary variables. A `DATABASE_URL` is required for the application to connect to PostgreSQL.
    Example `.env` file:
    ```env
    DATABASE_URL="postgresql://user:password@host:port/database"
    # Add other environment variables like session secrets, etc.
    SESSION_SECRET="your_strong_session_secret"
    ```
    *(Note: The specific environment variables needed might require further inspection of the server-side code, especially around database connection and session management.)*

4.  **Database Setup:**
    Apply database schema migrations:
    ```bash
    npm run db:push
    ```
    This command uses Drizzle Kit to synchronize your database schema with the definitions in `shared/schema.ts`.

### Running the Application

*   **Development Mode:**
    This command starts the backend server with `tsx` (for live TypeScript execution) and the Vite development server for the frontend.
    ```bash
    npm run dev
    ```
    The application should typically be accessible at `http://localhost:5173` (Vite's default) or as specified in the Vite configuration. The server will run on a port specified in `server/index.ts` (likely 3000 or 3001).

*   **Production Mode:**
    First, build the application:
    ```bash
    npm run build
    ```
    Then, start the production server:
    ```bash
    npm run start
    ```

## Key Features

*   User authentication (Login, Signup)
*   Patient and Professional roles/dashboards
*   Meal planning
*   Intermittent fasting tracking
*   Mood tracking
*   (Potentially others based on a deeper dive into components and routes)

## Available Scripts

*   `npm run dev`: Starts the development server for both frontend and backend.
*   `npm run build`: Builds the frontend and backend for production.
*   `npm run start`: Starts the production server (after building).
*   `npm run check`: Runs TypeScript type checking.
*   `npm run db:push`: Pushes schema changes to the database using Drizzle Kit.

## Database

This project uses Drizzle ORM to interact with a PostgreSQL database. The database schema is defined in `shared/schema.ts`.
To update the database schema after making changes to the schema definitions, run:
```bash
npm run db:push
```

## Project Structure (Simplified)

```
/
├── client/         # Frontend React application (Vite)
│   ├── src/
│   │   ├── components/ # UI components (likely Shadcn/UI)
│   │   ├── pages/      # Page components
│   │   ├── lib/        # Utility functions, query client
│   │   ├── App.tsx     # Main App component
│   │   └── main.tsx    # Entry point for React app
│   └── index.html
├── server/         # Backend Express application
│   ├── db.ts         # Database connection setup (Drizzle)
│   ├── routes.ts     # API routes
│   ├── index.ts      # Server entry point
│   └── vite.ts       # Vite middleware for Express in dev
├── shared/         # Code shared between client and server
│   └── schema.ts     # Drizzle ORM schema definitions
├── package.json    # Project dependencies and scripts
├── drizzle.config.ts # Drizzle Kit configuration
├── tailwind.config.ts # Tailwind CSS configuration
└── tsconfig.json   # TypeScript configuration
```
