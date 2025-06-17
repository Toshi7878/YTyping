# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
npm run dev          # Start development server with Turbopack

# Build & Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run Next.js linting
npm run tsc          # Run TypeScript type checking

# Database Management
npm run db:migrate   # Run Prisma migrations
npm run db:generate  # Generate Prisma client
npm run db:reset     # Reset database
npm run studio       # Open Prisma Studio
```

## Project Architecture

YTyping is a typing game application built with Next.js App Router, featuring YouTube video integration and real-time typing gameplay.

### Core Technology Stack
- **Framework**: Next.js 15.3 with App Router
- **Language**: TypeScript with strict mode disabled
- **UI State**: Jotai for atomic state management
- **Data Fetching**: tRPC with React Query
- **Database**: PostgreSQL with Prisma ORM (relation mode: prisma)
- **Authentication**: NextAuth.js with Discord and Google providers
- **Styling**: Tailwind CSS with custom components
- **Sound**: Pixi.js sound module

### Key Architectural Patterns

1. **Route Organization**:
   - `(home)` - Main landing page
   - `(typing)` - Game modes: `/type/[id]` (romaji) and `/ime/[id]` (IME input)
   - `(menus)` - Static pages (changelog, credit, manual)
   - `edit` - Map creation/editing interface
   - `user` - User profiles and settings
   - `timeline` - Activity feed

2. **State Management**:
   - Game state managed through Jotai atoms in `atoms/` directories
   - Separate stores for different game modes (type vs ime)
   - Storage atoms for persisting user preferences

3. **Data Flow**:
   - tRPC routers in `src/server/api/routers/` handle all API logic
   - Queries abstracted in `src/utils/queries/`
   - Server actions for real-time updates (likes, claps)

4. **Component Structure**:
   - Feature-specific components colocated with routes
   - Shared UI components in `src/components/ui/`
   - Game-specific components separated by scene (Ready, Playing, End)

5. **Database Schema**:
   - Maps store typing challenges with YouTube metadata
   - Results track user performance per map
   - Difficulty calculations stored separately
   - IME-specific results tracked independently

## Important Considerations

- Path aliases use `@/` for `./src/`
- React Strict Mode is disabled
- Prisma uses preview feature "typedSql"
- Environment variables required: DATABASE_URL, DIRECT_URL (for Prisma)
- Audio files stored in `public/wav/` for typing sound effects