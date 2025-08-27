# Forge - Ritual Tool for Forging Discipline

A dark, brutalist mobile-first PWA for tracking daily ritual phases, inspired by Marcus Vey's philosophy. Built with React, TypeScript, Tailwind CSS, and Framer Motion.

## Features

- **6 Daily Phases**: From Awakening to Closing, each phase has specific ritual tasks
- **Marcus Vey Voice**: Sharp, direct microcopy throughout the experience
- **Offline-First**: Works without internet connection via service worker
- **localStorage Persistence**: All data stored locally, no backend needed
- **Dark Brutalist Theme**: Void-black background with Mournshard gold accents
- **Ritual Animations**: Forge strikes, molten gold progress, ember particles
- **Mobile Optimized**: Large tap targets, haptic feedback, thumb-friendly layout

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## How to Use

1. **Open the app**: Navigate to http://localhost:5173 in development
2. **Complete tasks**: Tap each task to mark as complete
3. **Track The Vessel**: Add water intake with quick buttons
4. **Track The March**: Add steps with quick increments
5. **Win the day**: Complete all required tasks + water + steps goals
6. **Build your streak**: Consecutive victories forge your discipline

## The Phases

1. **Phase I - Awakening** (Wake → +2h): Hydration, fasted training, log lifts
2. **Phase II - Creation** (+2h → +4h): Maker sprint, reset walk
3. **Phase III - The Fasted March** (+4h → +7h): Steps progress, maintain fast
4. **Phase IV - The Breaking** (+7h → +10h): First meal, spice medicine, admin work
5. **Phase V - The Forgefire** (+10h → +13h): Second meal, family time, solo recharge
6. **Phase VI - The Closing** (Final 2h): Complete water goal, shadow rule check, daily proof

## Marcus Vey Messages

- "Action is the answer."
- "Win the phase."
- "The Forge Holds. Victory is yours."
- "Resistance spotted. Will you answer?"
- "Break it, and the Forge cools."

## Technical Details

- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom forge theme
- **Animations**: Framer Motion for ritual interactions
- **Icons**: Lucide React for etched-line iconography
- **Storage**: localStorage with 3am daily reset
- **PWA**: Service worker for offline support

## Customization

Edit goals in Settings:
- The Vessel Goal (water): Default 128oz
- The March Goal (steps): Default 10,000

## Installation as PWA

1. Open the app in Chrome/Safari on mobile
2. Tap the share/menu button
3. Select "Add to Home Screen"
4. The Forge icon will appear on your device

## Build Status

✓ All tasks implemented
✓ PWA features enabled
✓ Marcus Vey voice integrated
✓ Dark brutalist theme applied
✓ Ritual animations working
✓ localStorage persistence active

---

*"The Forge bends to your will."*
