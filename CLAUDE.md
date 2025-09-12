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

### Theme System
- Multiple theme presets: default (shadcn neutral), tangerine, brutalist, soft-pop
- Theme files located in `src/styles/presets/`
- Theme generation script at `src/scripts/generate-theme-presets.ts`
- Global theme management via Zustand store in `src/stores/preferences/`

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