# Wedding Invitation Site — Jeremy Chee & Joanna Tong

## Project Overview
Digital wedding invitation (e-kad) for Jeremy Chee & Joanna Tong.
- **Date:** 20 September 2026 (Sunday)
- **Venue:** M Resort & Hotel Kuala Lumpur
- **Events:** Holy Matrimony (11:00 AM), Wedding Reception (7:00 PM)

## Tech Stack
- **Monorepo:** pnpm workspaces
- **Frontend:** React 19 + Vite 8 + TypeScript 5 (`packages/web`)
- **Infra:** AWS CDK (`packages/infra`) — TBD
- **Backend:** AWS Lambda + DynamoDB (serverless) — TBD
- **Styling:** Plain CSS, CSS custom properties for theming
- **Fonts:** Cormorant Garamond (serif) + Montserrat (sans) via Google Fonts

## Commands
- `pnpm dev` — start frontend dev server
- `pnpm build` — type-check + production build
- `pnpm --filter web preview` — preview production build

## Project Structure
```
wedding/
├── package.json            — Root workspace
├── pnpm-workspace.yaml     — Workspace config
├── CLAUDE.md
├── packages/
│   ├── web/                — React frontend
│   │   ├── package.json
│   │   ├── index.html
│   │   ├── vite.config.js
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── main.tsx
│   │   │   ├── App.tsx           — Root component, state management
│   │   │   ├── styles/index.css  — All styles
│   │   │   └── components/
│   │   │       ├── AnimateOnScroll.tsx
│   │   │       ├── Cover.tsx
│   │   │       ├── Hero.tsx
│   │   │       ├── Countdown.tsx
│   │   │       ├── Events.tsx
│   │   │       ├── Venue.tsx
│   │   │       ├── Gallery.tsx
│   │   │       ├── Rsvp.tsx
│   │   │       ├── Wishes.tsx
│   │   │       ├── Footer.tsx
│   │   │       └── MusicToggle.tsx
│   │   └── public/
│   │       ├── images/
│   │       └── music/
│   └── infra/              — AWS CDK (TBD)
```

## Conventions
- Functional components only, no class components
- State lives in App.tsx and is passed down via props
- Shared types (`RsvpData`, `Wish`) exported from App.tsx
- Strict TypeScript (`strict: true`, `noUncheckedIndexedAccess: true`)
- One CSS file for all styles (no CSS modules or CSS-in-JS)
- CSS variables defined in `:root` for theming
- No external animation libraries — using custom IntersectionObserver
