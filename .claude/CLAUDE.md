# Treehouse - Project Context

## Overview
Family micro-apps hub. Playful, gamified household coordination for families with kids 8-15.

## Tech Stack
- Next.js 15 (App Router)
- TypeScript
- Drizzle ORM + Supabase (PostgreSQL)
- Tailwind CSS + shadcn/ui
- Vercel hosting

## Architecture

### Current (v0.1 - Pre-MVP)
- Local storage only, no auth
- Single family per device
- Three micro-apps: Chore Spinner, Dinner Picker, Daily Checklist

### Directory Structure
```
src/
  app/           # Next.js app router pages
  components/
    ui/          # shadcn components
    micro-apps/  # individual micro-app components
  db/            # Drizzle schema + connection
  lib/           # utilities
  hooks/         # React hooks
  stores/        # local state (localStorage)
```

## Design Principles
- **Playful > Professional** - Kids are users, make it fun
- **Minimal friction** - One tap to do common actions
- **Visible progress** - Points, streaks, leaderboards always visible
- **Mobile-first** - But works great on shared iPad

## Key Entities
- **Member** - Family member (parent or child)
- **Activity** - Completed action (chore, checklist item, etc.)
- **Item** - Configurable option (chore, dinner option, etc.)

## Commands
```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run db:push  # Push schema to database
npm run db:studio # Open Drizzle Studio
```

## GitHub Workflow
- Main branch: `main`
- Feature branches: `feat/[feature-name]`
- Issues track all work
- PRs require description of changes
