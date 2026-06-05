// Unified 100-level system for Gipsy Word Connect.
//
// Block pattern (strict per user spec):
//   Levels  1- 5: word_connect
//   Levels  6-10: word_search
//   Levels 11-15: word_connect
//   ... alternating every 5 levels ...
//   Levels 96-100: word_search (level 100 = final, special phrase)
//
// Anagram (third puzzle type) replaces the MIDDLE level of each word_connect block,
// so levels 3, 13, 23, 33, 43, 53, 63, 73, 83, 93 are anagrams — for variety.
//
// Bonus levels (every 10th: 10, 20, 30, ... 100) live in word_search blocks and
// feature a hidden funny Romani phrase formed by leftover letters of the grid.

import { WORD_CONNECT_LEVELS } from "./wordConnectLevels";
import { ANAGRAM_LEVELS } from "./anagramLevels";
import { WORD_SEARCH_LEVELS } from "./wordSearchSource";

const TOTAL = 100;
const BLOCK = 5;

function blockTypeFor(levelId) {
  // 1-indexed. Each block of 5 alternates: starts with word_connect.
  const blockIndex = Math.floor((levelId - 1) / BLOCK); // 0..19
  return blockIndex % 2 === 0 ? "word_connect" : "word_search";
}

function buildWordConnectQueue() {
  // 50 slots needed, but the 3rd level of each block (10 anagram slots) is replaced.
  // So we need 40 pure word_connect levels and 10 anagram levels.
  // Word connect pools we have: 50. Pick the first 40 in order.
  const wc = [...WORD_CONNECT_LEVELS].slice(0, 40);
  const anag = [...ANAGRAM_LEVELS]; // 10
  return { wc, anag };
}

function buildWordSearchQueue() {
  // Source has 50 entries; original level 30 ("Velké finále") sits at index 29.
  // We reorder so the grand final lands on level 100 (last word_search slot).
  const all = [...WORD_SEARCH_LEVELS];
  const finalLevel = all.splice(29, 1)[0]; // remove orig 30 (special phrase)
  // Now `all` has 49 entries; append the final at the end → 50.
  all.push(finalLevel);
  return all;
}

function shouldBeAnagram(levelId, type) {
  // Anagram = middle level (3rd) of each word_connect block.
  if (type !== "word_connect") return false;
  const localIdx = ((levelId - 1) % BLOCK); // 0..4
  return localIdx === 2;
}

export function buildLevels() {
  const { wc: wcQueue, anag: anagQueue } = buildWordConnectQueue();
  const wsQueue = buildWordSearchQueue();

  const out = [];
  for (let id = 1; id <= TOTAL; id++) {
    const baseType = blockTypeFor(id);
    if (baseType === "word_connect") {
      if (shouldBeAnagram(id, baseType)) {
        const a = anagQueue.shift();
        out.push({
          id,
          type: "anagram",
          isMilestone: id % 10 === 0,
          isFinal: id === 100,
          ...a,
        });
      } else {
        const w = wcQueue.shift();
        out.push({
          id,
          type: "word_connect",
          isMilestone: id % 10 === 0,
          isFinal: id === 100,
          ...w,
        });
      }
    } else {
      const ws = wsQueue.shift();
      out.push({
        id,
        type: "word_search",
        isMilestone: id % 10 === 0,
        isBonus: id % 10 === 0, // every 10th: leftover-letter funny word drop
        isFinal: id === 100,
        // word_search payload comes already prepared
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
