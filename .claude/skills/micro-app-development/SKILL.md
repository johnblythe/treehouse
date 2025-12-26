---
name: micro-app-development
description: Guidelines for building Treehouse micro-apps. Each micro-app is a self-contained, playful feature.
---

# Micro-App Development

## Structure

Each micro-app lives in `src/components/micro-apps/[name]/`:

```
src/components/micro-apps/chore-spinner/
  index.tsx           # Main component, exported
  ChoreWheel.tsx      # Sub-components
  useChoreSpinner.ts  # Hook for logic
  types.ts            # TypeScript types
```

## Design Principles

1. **Self-contained** - Micro-app manages its own state
2. **Points-aware** - Integrates with family points system
3. **Playful UI** - Animations, sounds, celebrations
4. **Mobile-first** - Touch-friendly, works on small screens

## Required Props

Every micro-app receives:

```typescript
interface MicroAppProps {
  familyMembers: Member[];
  onPointsAwarded: (memberId: string, points: number, activity: string) => void;
}
```

## State Management

For v0.1 (local storage):

```typescript
// Use localStorage hook
import { useLocalStorage } from "@/hooks/useLocalStorage";

const [items, setItems] = useLocalStorage<ChoreItem[]>("chore-spinner-items", []);
```

## Animation Guidelines

- Use Framer Motion for complex animations
- CSS transitions for simple hover/active states
- Celebrate wins: confetti, bounce, glow effects
- Keep animations under 500ms for responsiveness

## Sound Effects (Future)

- Optional, user can mute
- Satisfying clicks, whooshes, celebrations
- No annoying loops

## Testing Checklist

- [ ] Works on mobile viewport
- [ ] Touch interactions feel good
- [ ] Points awarded correctly
- [ ] State persists on refresh
- [ ] Accessible (keyboard nav, screen reader)
