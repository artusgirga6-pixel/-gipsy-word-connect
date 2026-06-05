# Romani Word Search — PRD

## Original problem statement
This new game will be a 30-level Romani word search where completing every single level reveals a funny Romani bonus word or phrase left over from the remaining letters, with the final level featuring the specific phrase "Vyhral si vyraindal meliari topánka", leaving the rest of the funny words up to his.

## User choices (gathered)
- Theme: Mixed - themed words + funny Romani phrases per level
- Grid size: Progressively growing (8×8 → 15×15)
- Bonus phrases: AI to invent funny Romani phrases for 29 levels; level 30 uses the user's special phrase
- Visual style: Playful / folkloric
- Persistence: Backend + MongoDB

## Architecture
- Backend: FastAPI + MongoDB (Motor). Endpoints under /api:
  - POST /api/progress/init
  - GET /api/progress/{player_id}
  - POST /api/progress/complete
  - POST /api/progress/reset/{player_id}
  - GET /api/leaderboard
- Frontend: React + Tailwind + Shadcn UI + framer-motion + canvas-confetti
  - Routes: `/` (Level select), `/level/:id` (Game)
  - Local storage stores `romword_player_id` to bind progress to a player

## Game model
- 30 levels defined in `/app/frontend/src/data/levels.js`
- Each level: gridSize, words[], phrase (display), translation, theme
- Auto-fitting trims words to fit (gridSize² - phraseCleanLetters)
- Grid generator: `/app/frontend/src/lib/gridGenerator.js` deterministic with seed; fills remaining cells with phrase letters in reading order

## Implemented features (Feb 2026)
- 30 levels with progressive grid sizing, themed words, hidden Romani bonus phrases
- Level 30 hidden phrase: "Vyhral si vyraindal meliari topánka"
- Pointer-drag & tap-to-tap word selection
- Hint button (reveals first 2 cells of a remaining word)
- Reshuffle button (regenerates grid with new seed)
- Reveal overlay with confetti and Czech translation of phrase
- Level select bento layout with milestone tiles (10, 20, 30)
- Backend-synced progress with discovered phrases collection
- Reset progress (with confirmation)

### Phase 2 — Feb 2026
- Onboarding modal with optional player name (gated by localStorage flag)
- Leaderboard sheet showing top players sorted by completed level count then total best time
- Per-level best time tracking (★ badge on level select tile + game header)
- In-game running timer; reveal overlay shows time + best
- Share buttons on level select (overall progress) and reveal overlay (phrase share) — Web Share API + clipboard fallback
- Sound effects via Web Audio (find, complete, milestone fanfare, reveal sparkle, click); user-controllable mute toggle
- Localization: Czech (default), English, Romanes — language switcher in header, persisted
- Festive milestone treatment in reveal overlay (gradient + thick gold border + extra confetti volleys)

## Backlog / Next steps
- P1: Per-level best time tracking and leaderboard view
- P1: Optional player name in onboarding modal (currently anonymous)
- P2: Sound effects (find / complete / reveal)
- P2: Localization toggle (CZ/EN/Romani)
- P2: Word search reverse direction visual line overlay

## Test credentials
N/A — anonymous play with auto-generated player_id.
