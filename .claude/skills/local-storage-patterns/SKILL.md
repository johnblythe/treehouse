---
name: local-storage-patterns
description: Patterns for localStorage-based state in Treehouse v0.1 (pre-auth).
---

# Local Storage Patterns

## Why Local Storage (v0.1)

- No accounts yet = no server state
- Single family per device
- Fast iteration, no backend complexity
- Easy to migrate to Supabase later

## Core Hook

```typescript
// src/hooks/useLocalStorage.ts
import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const prefixedKey = `treehouse:${key}`;
  
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    const stored = localStorage.getItem(prefixedKey);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(prefixedKey, JSON.stringify(value));
  }, [prefixedKey, value]);

  return [value, setValue] as const;
}
```

## Key Naming Convention

All keys prefixed with `treehouse:`:

```
treehouse:family-members
treehouse:chore-spinner-items
treehouse:dinner-options
treehouse:checklist-items
treehouse:activity-history
```

## Data Structures

### Family Members
```typescript
interface Member {
  id: string;
  name: string;
  avatar: string; // emoji
  role: "parent" | "child";
  points: number;
  createdAt: string;
}
```

### Activity History
```typescript
interface Activity {
  id: string;
  memberId: string;
  type: "chore" | "checklist" | "dinner_pick";
  name: string;
  points: number;
  completedAt: string;
}
```

## Migration Path

When adding auth/Supabase:

1. Check if user is authenticated
2. If yes, sync localStorage to server, then use server state
3. If no, continue using localStorage
4. On first login, merge localStorage data to account

## Gotchas

- Always handle SSR (check `typeof window`)
- Use `useEffect` for writes to avoid hydration mismatch
- Keep stored data serializable (no functions, dates as ISO strings)
