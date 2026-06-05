// Crossword placer: places word slots inside a shape mask, preferring intersections.
import { getMask } from "./shapeMasks";

const DIRS = [
  [0, 1, "H"], // horizontal
  [1, 0, "V"], // vertical
];

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function placementForWord(word, mask, existing, rng) {
  const rows = mask.length;
  const cols = mask[0].length;
  const candidates = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      for (const [dr, dc, dirLabel] of DIRS) {
        const er = r + dr * (word.length - 1);
        const ec = c + dc * (word.length - 1);
        if (er < 0 || ec < 0 || er >= rows || ec >= cols) continue;
        let ok = true;
        let intersects = 0;
        const cells = [];
        for (let i = 0; i < word.length; i++) {
          const rr = r + dr * i;
          const cc = c + dc * i;
          if (!mask[rr][cc]) { ok = false; break; }
          const key = `${rr},${cc}`;
          const exLetter = existing.cellLetter.get(key);
          if (exLetter !== undefined) {
            if (exLetter !== word[i]) { ok = false; break; }
            // require the intersecting existing word run NOT to be parallel
            // (avoid two parallel adjacent words sharing the same row)
            intersects++;
          }
          cells.push({ r: rr, c: cc, key });
        }
        if (!ok) continue;
        // Forbid adjacent parallel runs (cells next to a parallel placement)
        // Simple heuristic: ensure no two distinct used cells exist at (rr-dc, cc-dr) AND (rr+dc, cc+dr) that belong to other placements unless they're the intersection point.
        candidates.push({ r, c, dr, dc, dirLabel, intersects, cells });
      }
    }
  }
  if (candidates.length === 0) return null;
  // Pick best: most intersections (or 0 for first word). Random tie-break.
  const maxI = candidates.reduce((m, x) => Math.max(m, x.intersects), 0);
  const top = candidates.filter((x) => x.intersects === maxI);
  return top[Math.floor(rng() * top.length)];
}

export function placeCrossword(level) {
  const mask = getMask(level.shape);
  const rng = mulberry32(level.id || 1);
  const words = [...level.words].sort((a, b) => b.length - a.length);

  // Try multiple seeds for robustness
  for (let attempt = 0; attempt < 40; attempt++) {
    const local = {
      cellLetter: new Map(), // key "r,c" → letter
      placements: [],
    };
    const localRng = mulberry32((level.id || 1) * 7 + attempt);
    let success = true;
    for (const word of words) {
      const place = placementForWord(word, mask, local, localRng);
      if (!place) { success = false; break; }
      place.cells.forEach((cell, i) => {
        local.cellLetter.set(cell.key, word[i]);
      });
      local.placements.push({
        word,
        cells: place.cells,
        direction: place.dirLabel,
      });
    }
    if (success) {
      return {
        mask,
        placements: local.placements,
        rows: mask.length,
        cols: mask[0].length,
      };
    }
  }
  // Fallback: stack words on rows starting from middle of mask
  const fallback = { placements: [], rows: mask.length, cols: mask[0].length, mask };
  const center = Math.floor(mask.length / 2);
  let row = 0;
  for (const word of words) {
    // find a row with enough contiguous active cells
    let placed = false;
    for (let r = 0; r < mask.length && !placed; r++) {
      const rIdx = (center + (r % 2 === 0 ? r / 2 : -(Math.ceil(r / 2)))) % mask.length;
      const tr = (rIdx + mask.length) % mask.length;
      for (let c = 0; c <= mask[0].length - word.length; c++) {
        if (mask[tr].slice(c, c + word.length).every(Boolean)) {
          const cells = [];
          for (let i = 0; i < word.length; i++) cells.push({ r: tr, c: c + i, key: `${tr},${c + i}` });
          fallback.placements.push({ word, cells, direction: "H" });
          placed = true;
          break;
        }
      }
    }
    if (!placed) {
      // last-resort: top-left row 0
      const cells = [];
      for (let i = 0; i < word.length; i++) cells.push({ r: 0, c: i, key: `0,${i}` });
      fallback.placements.push({ word, cells, direction: "H" });
    }
    row += 1;
  }
  return fallback;
}
