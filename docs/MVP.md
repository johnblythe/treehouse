# Treehouse MVP Specification

**Version:** 0.2 (Post-Soul Pivot)
**Goal:** Prove "less on chores, more on character"

---

## Core Concept

Treehouse helps kids 10-16 build character through daily life. Chores are one input, not the point. Success = kid graduates from needing the app.

---

## The 5 Stats

```
💪 GRIT        Doing hard things, resilience, bouncing back
🧠 WISDOM      Self-awareness, reflection, learning from mistakes
❤️  HEART      Kindness, helping others, empathy
⚡ INITIATIVE  Acting without being asked, noticing needs
⚖️ TEMPERANCE  Self-control, delayed gratification, patience
```

Visual: Pentagon/radar chart showing balance across dimensions.

---

## MVP Features

### 1. Personal Dashboard (replaces Leaderboard)

The heart of the experience. Kid's view of their own growth.

```
┌─────────────────────────────────────────────────────────────────┐
│  EMMA                                            Level 7        │
│  ═══════════════════════════════════════════════════════════    │
│                                                                 │
│           💪 Grit                                               │
│              12                                                 │
│             ╱    ╲                                              │
│    ⚖️ 8 ───       ─── 🧠 15                                     │
│   Temperance        Wisdom                                      │
│            ╲      ╱                                              │
│        ⚡ 6 ──── ❤️ 11                                           │
│     Initiative   Heart                                          │
│                                                                 │
│  ────────────────────────────────────────────────────────────   │
│                                                                 │
│  🔥 Active streak: 5 days                                       │
│  🏆 Best streak: 12 days                                        │
│  💪 Comebacks: 3                                                │
│                                                                 │
│  Recent growth:                                                 │
│  • +10 🧠 Daily check-in                                        │
│  • +15 💪 Finished hard chore                                   │
│  • +20 ⚡ Helped without being asked                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key elements:**
- Stat pentagon (visual balance)
- Overall level (sum of growth)
- Streak with bounce-back count
- Recent XP log with reasons

### 2. Self-Report Log

Kid logs their own wins. Honor system.

```
┌─────────────────────────────────────────────────────────────────┐
│  LOG SOMETHING YOU DID                                          │
│  ═══════════════════════════════════════════════════════════    │
│                                                                 │
│  What did you do?                                               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Helped my sister with her homework                      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  Which stat does this build?                                    │
│                                                                 │
│  [💪 Grit]  [🧠 Wisdom]  [❤️ Heart]  [⚡ Init]  [⚖️ Temp]       │
│                           ^^^^^^^^                              │
│                           selected                              │
│                                                                 │
│  Was this hard for you?   [Yes, +5 bonus]  [No]                │
│                                                                 │
│                                        [Cancel]  [Log It +15]   │
└─────────────────────────────────────────────────────────────────┘
```

**Preset quick-logs:**
- "I helped someone" → ❤️ Heart
- "I did something without being asked" → ⚡ Initiative
- "I saved money / didn't buy something" → ⚖️ Temperance
- "I told the truth about something hard" → 💪 Grit + 🧠 Wisdom
- "I stayed calm when upset" → ⚖️ Temperance
- "I finished something I didn't want to do" → 💪 Grit
- [Custom] → Pick stat

**XP values:**
- Base log: 15 XP
- "Was hard for you" bonus: +5 XP
- Custom description: +5 XP

### 3. Daily Check-in

30-60 second reflection. Builds Wisdom.

```
┌─────────────────────────────────────────────────────────────────┐
│  DAILY CHECK-IN                                      [Skip]     │
│  ═══════════════════════════════════════════════════════════    │
│                                                                 │
│  How was today?                                                 │
│                                                                 │
│     😫      😐      🙂      😊      🤩                          │
│   rough    meh    okay    good   great                          │
│                                                                 │
│  One thing I'm proud of today:                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│                                        [Save → +10 🧠 Wisdom]   │
└─────────────────────────────────────────────────────────────────┘
```

**Rules:**
- Optional (can skip)
- Once per day
- Private by default
- Completing = Wisdom XP

### 4. Micro-Apps (Grinding)

Keep existing micro-apps as fun ways to grind XP. Parent-configured.

**Chore Spinner**
- Random task picker
- Completing a chore → +20 💪 Grit
- Parent sets available chores

**Dinner Picker**
- Family contribution
- Participating → +10 ❤️ Heart + +5 🤝 (family moment)

**Future grind opportunities:**
- Money Tracker (⚖️ Temperance)
- Goal Setter (💪 Grit + 🧠 Wisdom)
- Random Acts generator (❤️ Heart + ⚡ Initiative)

### 5. Forgiving Streaks

No anxiety. Bounce-backs celebrated.

```
STREAK DISPLAY:
🔥 5 days active  |  🏆 Best: 12  |  💪 Comebacks: 3

AFTER MISSING A DAY:
"Welcome back! Returning after a break takes Grit. +15 💪"

BUILT-IN REST:
- 1-2 days off per week don't break streak (configurable)
- "Rest days" shown differently in calendar view
```

### 6. Basic Avatar

Using DiceBear or Boring Avatars. Stat-influenced.

```
AVATAR GENERATION:
- Base shape/style from overall level
- Primary color from highest stat
- Secondary color from second-highest stat
- Complexity increases with level

STAT → COLOR MAPPING:
💪 Grit      → Orange/Red (warm, strong)
🧠 Wisdom    → Purple/Indigo (thoughtful)
❤️  Heart    → Pink/Rose (warm, caring)
⚡ Initiative → Yellow/Gold (bright, active)
⚖️ Temperance → Blue/Teal (calm, balanced)
```

### 7. Parent View (Observation Only)

Parents can see, not control.

```
┌─────────────────────────────────────────────────────────────────┐
│  EMMA'S GROWTH                                   [Family View]  │
│  ═══════════════════════════════════════════════════════════    │
│                                                                 │
│  Level 7  •  Active 5 days  •  3 comebacks                     │
│                                                                 │
│  [Stat pentagon - same as kid sees]                            │
│                                                                 │
│  This week:                                                     │
│  • 4 self-reports logged                                        │
│  • 5 daily check-ins completed                                  │
│  • 2 chores via Chore Spinner                                   │
│  • Strongest growth: 🧠 Wisdom (+45)                            │
│                                                                 │
│  [Cannot see: check-in content, self-report details]           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Parent sees:**
- Overall stats and level
- Activity counts (not content)
- Streak status
- Growth trends

**Parent does NOT see:**
- Check-in content (mood, proud moments)
- Self-report descriptions
- Anything kid wants private

---

## What's NOT in MVP

| Feature | Why Later |
|---------|-----------|
| Full avatar evolution | Prove core loop first |
| Family kudos/360 | Adds complexity |
| Conflict → growth logging | V2 feature |
| AI journal summaries | Needs infra |
| Archetypes | Emerges naturally from stats |
| Weekly reflection | Daily first |
| Multiple family members view | One kid PoC first |

---

## Technical Requirements

### New Schema

```
Stats:
- id, memberId, statType, currentXP, level

ActivityLog:
- id, memberId, type (self_report|check_in|micro_app|bounce_back)
- statAffected, xpGained, description, createdAt

Streaks:
- id, memberId, currentStreak, bestStreak, comebackCount
- lastActiveDate, restDaysThisWeek

CheckIns:
- id, memberId, mood (1-5), proudOf (text), createdAt
- private (boolean, default true)
```

### Avatar Integration

- DiceBear API or Boring Avatars
- Generate on stat change
- Cache/store generated avatar URL

---

## Success Criteria

MVP works if:

1. **Kid engagement:** Opens app unprompted 3x/week
2. **Self-reporting:** Logs at least 2 self-reports/week
3. **Reflection habit:** Completes check-in 50%+ of days
4. **Bounce-back works:** Returns within 2 days of lapse
5. **Parent value:** Can see kid is engaging meaningfully
6. **No gaming:** Kid isn't just spam-logging for XP

---

## Development Phases

### Phase 1: Core Loop
- [ ] Personal dashboard (stats, level, streak)
- [ ] Self-report log with presets
- [ ] Daily check-in
- [ ] XP system foundation

### Phase 2: Integration
- [ ] Connect Chore Spinner → Grit XP
- [ ] Connect Dinner Picker → Heart XP
- [ ] Forgiving streak logic
- [ ] Bounce-back detection + reward

### Phase 3: Polish
- [ ] Avatar integration (DiceBear)
- [ ] Parent observation view
- [ ] Onboarding flow
- [ ] Empty states and encouragement

---

*Last updated: Session 20 - Finding the Soul*
