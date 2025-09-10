# Overview

This is a Smart Attendance System built with React/TypeScript frontend and Express.js backend. The application enables teachers to manage attendance for their classes with features like dashboard analytics, manual attendance marking, history tracking, and comprehensive reporting. The system is designed with modern web technologies including Drizzle ORM for database management, shadcn/ui components for the interface, and TanStack Query for efficient data fetching.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **Build Tool**: Vite for fast development and optimized builds

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for type safety across the stack
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **API Pattern**: RESTful API design with Express routes
- **Error Handling**: Centralized error middleware
- **Development**: Hot reload with Vite integration in development mode

## Database Design
- **Users Table**: Stores teacher/admin accounts with role-based access
- **Classes Table**: Manages class information linked to teachers
- **Students Table**: Student records with optional RFID card integration
- **Attendance Records**: Daily attendance entries with multiple marking methods
- **Attendance Stats**: Aggregated statistics for performance tracking

## Authentication & Authorization
- **Session-based**: Uses Express sessions for authentication
- **Role-based Access**: Teacher, admin, and government user roles
- **Security**: CSRF protection and secure session management

## Key Features Architecture
- **Dashboard**: Real-time analytics with attendance rates and trends
- **Attendance Marking**: Support for manual, facial recognition, and RFID methods
- **Reporting**: Comprehensive analytics with export capabilities
- **Mobile Responsive**: Adaptive UI for different screen sizes

# External Dependencies

## Database & Storage
- **Neon Database**: Serverless PostgreSQL database with connection pooling
- **Drizzle ORM**: Type-safe database operations and migrations

## UI & Components
- **Radix UI**: Accessible component primitives
- **Lucide React**: Consistent icon library
- **Embla Carousel**: Touch-friendly carousel components
- **React Hook Form**: Form validation and management

## Development Tools
- **Vite**: Build tool with HMR support
- **ESBuild**: Fast JavaScript bundler for production
- **PostCSS**: CSS processing with Tailwind CSS
- **TypeScript**: Static type checking

## Utilities & Libraries
- **date-fns**: Date manipulation and formatting
- **clsx**: Conditional CSS class names
- **nanoid**: Unique ID generation
- **zod**: Runtime type validation

## Replit Integration
- **Vite Plugin**: Runtime error modal overlay
- **Cartographer**: Development environment mapping