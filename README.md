# Treehouse

**Your family's clubhouse.**

A playful family hub with micro-apps that make household coordination fun. Built for families with kids aged 8-15.

## The Problem

Family coordination is boring. Chore charts collect dust. Kids groan at task lists. Parents nag. Nobody wins.

## The Solution

Treehouse turns family tasks into playful micro-interactions. Points, leaderboards, and games transform "do your chores" into something kids actually engage with.

## v0.1 - Pre-MVP

No accounts. Local storage. Single family. Three micro-apps.

### Core Features
- **Family Setup** - Add members (name + avatar/color)
- **Points System** - Earn points, see them accumulate
- **Leaderboard** - Friendly competition between siblings

### Micro-Apps

1. **Chore Spinner** - Parent inputs 3 real chores, app generates 7 decoy chores that are harder/worse. Spin the wheel. Kids feel lucky when they land on real ones.

2. **Dinner Picker** - Add dinner options, spin or vote. Breaks the "what do you want for dinner?" loop.

3. **Daily Checklist** - Morning/evening routines. Timed. Points per item. Gamified consistency.

## Future Vision

- Family accounts + multi-device sync
- Shared display mode (kitchen iPad)
- Reward shop (redeem points for real rewards)
- More micro-apps: screen time auction, gratitude jar, family polls
- Subscription model for premium features

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** PostgreSQL via Supabase + Drizzle ORM
- **Styling:** Tailwind CSS + shadcn/ui
- **Hosting:** Vercel

## Development

```bash
npm install
npm run dev
```

## License

MIT
