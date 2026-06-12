// Unified 50-level system for Gipsy Word Connect.
//
// All 50 levels are 8-directional Word Search puzzles using the authentic
// Romani vocabulary. Difficulty grows with the grid size and richer word
// lists. Every 10th level (10, 20, 30, 40, 50) is a milestone/bonus level.
// Level 50 is the grand final "Vyhral si vyraindal meliari topánka".

import { WORD_SEARCH_LEVELS } from "./wordSearchSource";

const TOTAL = 50;

function buildWordSearchQueue() {
  // Source has 50 entries; the original level 30 ("Velké finále") sits at
  // index 29. We move it to the end so it becomes level 50 in the game.
  const all = [...WORD_SEARCH_LEVELS];
  const finalLevel = all.splice(29, 1)[0];
  return [...all, finalLevel];
}

export function buildLevels() {
  const queue = buildWordSearchQueue();
  const out = [];
  for (let id = 1; id <= TOTAL; id++) {
    const ws = queue[id - 1];
    if (!ws) break;
    out.push({
      id,
      type: "word_search",
      isMilestone: id % 10 === 0,
      isBonus: id % 10 === 0,
      isFinal: id === TOTAL,
      title: ws.title,
      gridSize: ws.gridSize,
      words: ws.words,
      phrase: ws.phrase,
      translation: ws.translation,
      phraseClean: ws.phraseClean,
    });
  }
  return out;
}

export const LEVELS = buildLevels();
export const TOTAL_LEVELS = LEVELS.length;
