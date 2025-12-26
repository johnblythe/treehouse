---
name: frontend-design
description: Design system and UI patterns for Treehouse. Playful, kid-friendly, mobile-first.
---

# Frontend Design

## Brand Vibe

- **Playful** - Not corporate, not baby-ish. Think Nintendo, not Fisher-Price.
- **Colorful** - Bold, saturated colors. Each family member gets a color.
- **Tactile** - Big touch targets, satisfying interactions.
- **Celebratory** - Wins feel special. Confetti, glows, bounces.

## Color Palette

```css
/* Primary - Treehouse green */
--primary: 142 76% 36%;

/* Member colors (assigned to family members) */
--member-red: 0 84% 60%;
--member-orange: 25 95% 53%;
--member-yellow: 48 96% 53%;
--member-green: 142 71% 45%;
--member-blue: 217 91% 60%;
--member-purple: 270 67% 47%;
--member-pink: 330 81% 60%;
--member-teal: 174 72% 40%;
```

## Typography

- Headers: Bold, slightly rounded (use Geist or similar)
- Body: Clean, readable
- Numbers/Points: Extra bold, maybe slightly larger

## Component Patterns

### Cards
```tsx
<Card className="rounded-2xl shadow-lg border-2 hover:scale-[1.02] transition-transform">
  {/* Rounded corners, subtle shadow, hover lift */}
</Card>
```

### Buttons
```tsx
// Primary action - big, bold
<Button size="lg" className="rounded-full px-8 text-lg font-bold">
  Spin!
</Button>

// Secondary - softer
<Button variant="outline" className="rounded-full">
  Settings
</Button>
```

### Points Display
```tsx
<div className="flex items-center gap-2 bg-yellow-100 rounded-full px-4 py-2">
  <span className="text-2xl">⭐</span>
  <span className="font-bold text-xl">{points}</span>
</div>
```

## Animation Patterns

### Celebration (on point award)
```tsx
import confetti from "canvas-confetti";

const celebrate = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });
};
```

### Micro-interactions
```tsx
// Hover scale
className="hover:scale-105 transition-transform"

// Tap feedback
className="active:scale-95 transition-transform"

// Smooth enter
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
>
```

## Layout

### Mobile (default)
- Single column
- Bottom nav or FAB for primary actions
- Cards stack vertically

### Tablet/Desktop (lg:)
- Side-by-side layouts where useful
- Leaderboard as sticky sidebar
- More whitespace

## Accessibility

- Touch targets minimum 44x44px
- Color contrast AA minimum
- Focus states visible
- Reduce motion option
