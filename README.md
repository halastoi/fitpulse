# FitPulse

Privacy-first, offline-first PWA for daily workout tracking with gamification and built-in radio.

**Live:** [fitpulse-delta.vercel.app](https://fitpulse-delta.vercel.app)

## Features

- **Workout Generator** — personalized workouts based on available equipment, difficulty level, and target muscle groups
- **Active Workout Tracker** — set-by-set logging with reps/weight input, rest timer, and progress bar. State persists across page refreshes
- **Gamification** — XP system, levels, daily streaks, and 8 unlockable achievements
- **Progress Dashboard** — XP and sets charts over time, workout history
- **Radio** — 18 ad-free SomaFM stations organized by energy level (high/medium/chill), floating player accessible from any page
- **i18n** — full translation in English, Romanian, Russian, and Spanish
- **Dark/Light/System Theme**
- **Custom Equipment** — 19 preset equipment options + add your own
- **PWA** — installable, service worker for offline caching
- **Offline-First** — all data stored locally in IndexedDB via Dexie.js

## Tech Stack

| Layer | Technology |
|-------|------------|
| UI Framework | React 19 + TypeScript (strict) |
| Build | Vite 8 (Rolldown) |
| Routing | TanStack Router (lazy-loaded routes) |
| State | Zustand (with persist middleware) |
| Offline DB | Dexie.js (IndexedDB) |
| Styling | Tailwind CSS v4 |
| Animation | Motion (Framer Motion) |
| Charts | Recharts |
| Testing | Vitest 4 + pre-commit hook |
| Deploy | Vercel |

## Project Structure

```
src/
├── components/
│   ├── layout/          # AppShell, BottomNav
│   └── ui/              # Button, Card, XPBar, StreakBadge, RadioPlayer, PWAInstallPrompt
├── pages/               # HomePage, WorkoutsPage, ProgressPage, ProfilePage
├── stores/              # Zustand stores (user, workout, theme, radio)
├── db/                  # Dexie.js schema + seed data (12 exercises, 8 achievements)
├── hooks/               # useTimer
├── i18n/                # translations (EN/RO/RU/ES) + useI18n store
├── utils/               # workout-generator, xp calculations
├── types/               # TypeScript interfaces
└── test/                # Vitest setup

public/
├── sw.js                # Service worker
├── manifest.json        # PWA manifest
└── icons/               # App icons (192, 512 PNG + SVG)
```

## Getting Started

```bash
npm install
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Preview production build locally |
| `npm test` | Run Vitest in watch mode |
| `npm run test:run` | Run all tests once |
| `npm run lint` | ESLint |

## Testing

49 tests covering:
- **useWorkoutStore** (17) — start, complete, skip, finish, abandon, persistence
- **useUserStore** (9) — XP, leveling, streak logic
- **XP utils** (14) — level calculation, progress, formatting
- **Workout generator** (9) — equipment/difficulty/muscle filtering, structure

Tests run automatically on every commit via git pre-commit hook.

## Radio

18 channels from [SomaFM](https://somafm.com) (ad-free, listener-supported):

**High energy:** PopTron, The Trip, Dub Step Beyond, Metal Detector, DEF CON Radio, Deep Space One

**Medium energy:** Fluid, Indie Pop Rocks, Beat Blender, Left Coast 70s, Underground 80s, Synphaera

**Chill / cooldown:** Groove Salad, Lush, Space Station, Drone Zone, Vaporwaves, ThistleRadio

## License

MIT
