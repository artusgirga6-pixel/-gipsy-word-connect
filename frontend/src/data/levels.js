// Unified 50-level system for Gipsy Word Connect.
//
// Strict alternation in blocks of 5:
//   Levels  1- 5: word_connect  (letter-box puzzles)
//   Levels  6-10: word_search   (8-directional, original)
//   Levels 11-15: word_connect
//   Levels 16-20: word_search   (bonus on lvl 20)
//   Levels 21-25: word_connect
//   Levels 26-30: word_search   (bonus on lvl 30)
//   Levels 31-35: word_connect
//   Levels 36-40: word_search   (bonus on lvl 40)
//   Levels 41-45: word_connect
//   Levels 46-50: word_search   (bonus on lvl 50 = grand final "Vyhral si vyraindal…")
//
// Every 10th level (10, 20, 30, 40, 50) is a bonus word_search with the
// hidden-leftover-letter funny phrase reveal.

import { WORD_CONNECT_LEVELS } from "./wordConnectLevels";
import { WORD_SEARCH_LEVELS } from "./wordSearchSource";

const TOTAL = 50;
const BLOCK = 5;

function blockTypeFor(levelId) {
  const blockIndex = Math.floor((levelId - 1) / BLOCK);
  return blockIndex % 2 === 0 ? "word_connect" : "word_search";
}

function buildWordSearchQueue() {
  // Source has 50 entries; original level 30 ("Velké finále") sits at index 29.
  // We pull the first 24 plus the special final at the end → 25 total.
  const all = [...WORD_SEARCH_LEVELS];
  const finalLevel = all.splice(29, 1)[0];
  const first24 = all.slice(0, 24);
  return [...first24, finalLevel];
}

export function buildLevels() {
  const wcQueue = [...WORD_CONNECT_LEVELS];
  const wsQueue = buildWordSearchQueue();

  const out = [];
  for (let id = 1; id <= TOTAL; id++) {
    const type = blockTypeFor(id);
    if (type === "word_connect") {
      const w = wcQueue.shift();
      out.push({
        id,
        type: "word_connect",
        isMilestone: id % 10 === 0,
        isFinal: id === TOTAL,
        ...w,
      });
    } else {
      const ws = wsQueue.shift();
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
  }
  return out;
}

export const LEVELS = buildLevels();
export const TOTAL_LEVELS = LEVELS.length;
