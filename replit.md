# Tourism Platform for AlBaha

## Overview

This is a comprehensive tourism platform specifically designed for the AlBaha region in Saudi Arabia. The application connects tourists with local tour guides, facilitating authentic travel experiences through a modern web interface. Built with React/TypeScript on the frontend and Express.js on the backend, it features a complete booking system, real-time messaging, and role-based access control for tourists, guides, and administrators. The platform emphasizes Arabic language support and cultural authenticity while providing modern web application features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side is built with **React 18** and **TypeScript**, utilizing a component-based architecture with functional components and hooks. The UI is built using **shadcn/ui** components with **Radix UI** primitives for accessibility and **Tailwind CSS** for styling. The application uses **Wouter** for client-side routing instead of React Router, providing a lightweight routing solution. State management is handled through **TanStack Query** (React Query) for server state management and caching, eliminating the need for Redux or Context API for most use cases.

### Backend Architecture
The server runs on **Express.js** with TypeScript, following a RESTful API design pattern. The application uses a layered architecture with separate modules for routing (`routes.ts`), data access (`storage.ts`), and database configuration (`db.ts`). Authentication is handled through **Replit's OpenID Connect** integration with Passport.js, providing secure user authentication and session management.

### Database Design
The application uses **PostgreSQL** as the primary database with **Drizzle ORM** for type-safe database operations and schema management. The database schema includes tables for users, places, guides, bookings, messages, and reviews, with proper relationships and indexes. Session storage is handled through PostgreSQL using `connect-pg-simple` for Express sessions.

### Authentication System
Authentication is built around **Replit's OIDC provider** with session-based authentication. The system supports role-based access control with three user roles: tourists, guides, and administrators. Sessions are stored in PostgreSQL with automatic cleanup and proper security configurations.

### Real-time Communication
The platform implements **WebSocket connections** for real-time messaging between tourists and guides. The messaging system supports both HTTP endpoints and WebSocket for seamless communication, with proper connection state management and reconnection logic.

### Build and Development Setup
The project uses **Vite** for frontend bundling and development server, with **esbuild** for production backend compilation. The development environment includes hot module replacement and proper TypeScript compilation. The monorepo structure separates client, server, and shared code with proper path aliases and TypeScript configurations.

### Styling and UI Components
The design system is built with **Tailwind CSS** using CSS custom properties for theming. The application includes comprehensive Arabic font support with **Noto Sans Arabic** and follows RTL (right-to-left) design patterns. The component library is based on shadcn/ui with extensive customization for Arabic language support.

## External Dependencies

- **Database**: PostgreSQL with Neon serverless driver for cloud deployment
- **Authentication Provider**: Replit OpenID Connect for secure user authentication
- **UI Framework**: Radix UI primitives for accessible component foundations
- **Styling**: Tailwind CSS for utility-first styling approach
- **Form Handling**: React Hook Form with Zod for validation and type safety
- **HTTP Client**: Built-in Fetch API with TanStack Query for caching and synchronization
- **Real-time Communication**: Native WebSocket API for messaging features
- **Date Handling**: date-fns for internationalized date operations
- **Development Tools**: Vite for frontend tooling and esbuild for backend compilation