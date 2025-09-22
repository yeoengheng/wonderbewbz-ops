# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run lint` - Run ESLint linting
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run generate:presets` - Generate theme presets using TypeScript script

## Architecture Overview

This is a Next.js 15 admin dashboard template built with TypeScript, Shadcn UI, and Tailwind CSS v4. It follows a **colocation file system architecture** where pages, components, and logic are grouped by feature within route folders.

### Business Domain

This application is an operations management system for **Wonderbewbz**, a breast milk processing service. The system manages the complete workflow from customer orders through processing and quality control:

- **Customer Management**: Track mothers and their order history
- **Order Processing**: Manage orders (typically from Shopify integration)
- **Machine Runs**: Track detailed processing runs with quality metrics
- **Individual Bag Tracking**: Monitor specific bags through the processing pipeline
- **Quality Control**: Water activity levels, weight tracking, and QA status management

### Key Technologies

- **Framework**: Next.js 15 (App Router), TypeScript
- **UI**: Shadcn UI components with Radix UI primitives
- **Styling**: Tailwind CSS v4 with custom theme presets
- **Authentication**: Clerk (configured in `src/lib/clerk.ts`)
- **Database**: Supabase (configured in `src/lib/supabase.ts`)
- **State Management**: Zustand for global state, React Hook Form for forms
- **Data Tables**: TanStack Table with drag-and-drop support

### Authentication Flow

- Public routes: `/`, `/auth/v2/login`, `/auth/v2/register`
- Authentication handled by Clerk middleware in `src/middleware.ts`
- Authenticated users accessing auth pages redirect to `/`
- Unauthenticated users accessing protected routes redirect to `/auth/v2/login`
- **Multi-tenant Security**: Clerk JWT integration with Supabase Row Level Security (RLS) ensures users only access their own data via `user_id` field

### Theme System

- Multiple theme presets: default (shadcn neutral), tangerine, brutalist, soft-pop, wonderbewbz
- Theme files located in `src/styles/presets/`
- Theme generation script at `src/scripts/generate-theme-presets.ts`
- Global theme management via Zustand store in `src/stores/preferences/`

### Database Schema

Core business entities with Row Level Security (RLS) enabled:

- **customers**: Customer information with Clerk user linking (`user_id` field)
- **orders**: Order management with Shopify integration fields
- **machine_runs**: Processing run tracking with detailed workflow data (mama info, dates, weights, quality metrics)
- **individual_bags**: Bag-level tracking for quality control and traceability

Data flow: Shopify Orders → Orders → Machine Runs → Individual Bags

### Project Structure

- `src/app/` - Next.js App Router pages and layouts
  - `(main)/` - Main dashboard routes with shared layout
  - `auth/v2/` - Authentication pages
- `src/components/` - Reusable UI components
  - `ui/` - Shadcn UI components
  - `data-table/` - Table components with drag-and-drop
- `src/lib/` - Utility functions and configurations
- `src/stores/` - Zustand state management
- `src/navigation/` - Sidebar navigation configuration

### Environment Variables

Required environment variables for Clerk and Supabase integration:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- Clerk environment variables (automatically handled by Clerk provider)

### Code Style

- ESLint configuration with multiple plugins including security, sonarjs, and unused-imports
- Prettier formatting with Tailwind CSS plugin
- Husky pre-commit hooks with lint-staged for code quality

# important-instruction-reminders

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (\*.md) or README files. Only create documentation files if explicitly requested by the User.
