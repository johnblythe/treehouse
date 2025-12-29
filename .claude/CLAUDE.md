# Treehouse - Project Context

## Soul (READ FIRST)
**Before making any product/design decisions, consult:**
- `/docs/SOUL.md` - Product philosophy and decisions
- `/docs/RESEARCH.md` - Evidence base for our approach

Core positioning: *"Less on chores, more on character."*

We're NOT a chore app. We're a childhood development tool wearing game clothes. Success = kid graduates from needing the app.

## Overview
Family development hub. Helps kids 10-16 build character, resilience, and self-awareness through daily life.

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
- **Development > Gamification** - Build character, not addiction
- **Intrinsic > Extrinsic** - Growth XP, not spendable points
- **Resilience > Perfection** - "Bounce back" > "never miss"
- **Personal > Competitive** - Your progress, not leaderboards
- **Playful > Professional** - Kids are users, make it fun
- **Mobile-first** - Ages 10-16 have their own devices

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
