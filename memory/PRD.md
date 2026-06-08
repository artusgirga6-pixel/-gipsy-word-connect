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

### Phase 4 — Feb 2026: Capacitor + AdMob + shaped masks
- **Capacitor 7.x** installed (`@capacitor/core/cli/android/ios`) — pinned to 7 because Capacitor 8 needs Node 22+ and the dev container is Node 20
- **@capacitor-community/admob 7.x** integrated via `/app/frontend/src/lib/ads.js`
  - Native: real `AdMob.prepareInterstitial/showInterstitial` and `prepareRewardVideoAd/showRewardVideoAd`
  - Web preview: graceful no-op fallback → AdModal renders the existing 5-second simulator
- **capacitor.config.ts** with Google's official test AdMob IDs (replace before publishing — instructions in `/app/memory/CAPACITOR.md`)
- **`AdModal.jsx`** now auto-detects native platform and calls real AdMob; otherwise simulator
- **Real shaped crossword masks** implemented:
  - `/app/frontend/src/lib/shapeMasks.js` — heart, plus, diamond, rhombus, star, rect
  - `/app/frontend/src/lib/crosswordPlacer.js` — seeded mulberry32 placer that places words inside mask, preferring intersections, with row-stack fallback
  - `CrosswordBoard.jsx` renders mask-aware grid: active+used cells = letter slots, decorative cells = ghost background, blocked cells = transparent
- **Native build doc**: `/app/memory/CAPACITOR.md` covers `yarn build → npx cap add android/ios → npx cap sync → npx cap open`, AdMob credential swap, SSV server-verification roadmap
- App renamed to **Gipsy Word Connect**, browser title updated, default UI language set to **Romanes**
- Total levels: **100**, strict alternating blocks (1-5 word_connect, 6-10 word_search, ...)
- Three puzzle types:
  - **word_connect**: letter circle (drag/tap) → fills a shaped crossword (6 shape themes: rect/heart/diamond/plus/rhombus/star); progressive difficulty 3 → 9 letters
  - **word_search**: original mechanic (50 levels; 30 from phase 1 + 20 new)
  - **anagram**: middle level of each word_connect block (3,13,23,...) — scrambled tiles → answer slots
- **Bonus levels** at every 10th (10, 20, …, 100): word_search with leftover-letter funny phrase reveal
- **Level 100** = grand finale, hidden phrase "Vyhral si vyraindal meliari topánka"
- **Coins economy** (backend MongoDB):
  - 100 starting coins for new players (init bonus)
  - Hammer hint → simulated ad → reveal a letter/cells
  - Lightbulb → simulated ad → +50 coins (ads_watched tracked)
  - Buy word → −100 coins → reveal whole word
- **Simulated AdModal** with 5s countdown (structured for AdMob SDK plug-in later)
- **Romani congrats popup** with 11 progressive praise tiers (Lačhi goďi → Najbareder goďi pe svetos)
- **Procedurally-generated Romani-style music** via Web Audio (10 melodies, auto-switch every 5 levels, user-toggleable, deferred until first user gesture)

### Phase 7 — Feb 2026: Static deterministic Word Connect levels + full Romani vocab coverage
- **Rewrote `/app/frontend/src/data/wordConnectLevels.js`** with fully static, deterministic, baked level data (no runtime generation):
  - 25 Word Connect levels with monotonic growth: targets 4→5→6→7→8 across blocks of 5
  - Every level satisfies/exceeds its target word count (verified by `/tmp/test_levels.js`)
  - Smallest L1 = 9 words (target 4), largest L25 = 10 words (target 8)
  - All `words[]` letters are guaranteed formable from `letters` pool
  - Crossword placer can place every word in its assigned shape mask
- **Injected leftover Romani vocab into `/app/frontend/src/data/wordSearchSource.js`** across L1-L24 + L30 (Velké finále): 92/92 master vocab words now appear in-game (added PHURO, PHURI, ASAVA, ROVAVA, TERNO, CHURI, PIJAKOS, GULO, BERSA, JEVEN, LINAJ, KERAVA, KHERE, KHERA, BESAVA, PINDRE, DIKHAVA, LACES, SASTO, PARNO, THUL, THUD, CHON, CIRIKLO, MULORO, GAT, LON, PHUV, NASVALIPEN, TELEVIZA, MURSORO, ROMNORI, SKAMIET, TATORO, KORORO, LOLO)
- Backend `/api/progress/*` all green (10/10 pytest); frontend e2e all green (10/10 review items in iteration_8.json)


## Backlog / Next steps
- P1: Per-level best time tracking and leaderboard view
- P1: Optional player name in onboarding modal (currently anonymous)
- P2: Sound effects (find / complete / reveal)
- P2: Localization toggle (CZ/EN/Romani)
- P2: Word search reverse direction visual line overlay

## Test credentials
N/A — anonymous play with auto-generated player_id.
