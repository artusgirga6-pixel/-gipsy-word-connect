// Deterministic grid generator for the word search.
// Places words on an N×N grid, then fills remaining cells with the
// bonus-phrase letters (in reading order) followed by random padding.

// Mulberry32 — small deterministic PRNG
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

const DIRS = [
  [0, 1],   // E
  [1, 0],   // S
  [1, 1],   // SE
  [-1, 1],  // NE
  [0, -1],  // W
  [-1, 0],  // N
  [-1, -1], // NW
  [1, -1],  // SW
];

function tryPlaceWord(grid, word, N, rng) {
  for (let attempt = 0; attempt < 250; attempt++) {
    const dir = DIRS[Math.floor(rng() * DIRS.length)];
    const [dr, dc] = dir;
    const r0 = Math.floor(rng() * N);
    const c0 = Math.floor(rng() * N);
    const rEnd = r0 + dr * (word.length - 1);
    const cEnd = c0 + dc * (word.length - 1);
    if (rEnd < 0 || rEnd >= N || cEnd < 0 || cEnd >= N) continue;
    let ok = true;
    const cells = [];
    for (let i = 0; i < word.length; i++) {
      const r = r0 + dr * i;
      const c = c0 + dc * i;
      const cur = grid[r][c];
      if (cur !== null && cur !== word[i]) {
        ok = false;
        break;
      }
      cells.push({ r, c });
    }
    if (ok) {
      for (let i = 0; i < word.length; i++) {
        const r = r0 + dr * i;
        const c = c0 + dc * i;
        grid[r][c] = word[i];
      }
      return cells;
    }
  }
  return null;
}

const FILLER_POOL = "AEIOURMNSTLKHBVDJPCHGZ".split("");

export function generateGrid(level, seedOverride = 0) {
  const N = level.gridSize;
  for (let attempt = 0; attempt < 60; attempt++) {
    const grid = Array.from({ length: N }, () => Array(N).fill(null));
    const placements = [];
    const rng = mulberry32(level.id * 9973 + attempt + seedOverride * 131);
    const words = [...level.words].sort((a, b) => b.length - a.length);
    let allPlaced = true;
    for (const word of words) {
      const cells = tryPlaceWord(grid, word, N, rng);
      if (!cells) {
        allPlaced = false;
        break;
      }
      placements.push({ word, cells });
    }
    if (!allPlaced) continue;

    // Fill remaining cells: phrase letters first (in reading order), then random.
    const phraseClean = level.phraseClean;
    const revealCells = [];
    let pIdx = 0;
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (grid[r][c] === null) {
          if (pIdx < phraseClean.length) {
            grid[r][c] = phraseClean[pIdx];
            revealCells.push({ r, c, letter: phraseClean[pIdx], idx: pIdx });
            pIdx++;
          } else {
            grid[r][c] = FILLER_POOL[Math.floor(rng() * FILLER_POOL.length)];
          }
        }
      }
    }
    if (pIdx < phraseClean.length) continue; // not enough free cells; retry
    return { grid, placements, revealCells, gridSize: N };
  }
  throw new Error(`Could not generate grid for level ${level.id}`);
}

// Given two cell positions, return the list of cells on a straight line
// between them (8-direction). Returns null if not a straight line.
export function lineBetween(a, b) {
  const dr = b.r - a.r;
  const dc = b.c - a.c;
  if (dr === 0 && dc === 0) return [a];
  const stepR = Math.sign(dr);
  const stepC = Math.sign(dc);
  const absR = Math.abs(dr);
  const absC = Math.abs(dc);
  if (!(absR === 0 || absC === 0 || absR === absC)) return null;
  const steps = Math.max(absR, absC);
  const cells = [];
  for (let i = 0; i <= steps; i++) {
    cells.push({ r: a.r + stepR * i, c: a.c + stepC * i });
  }
  return cells;
}

export function cellsEqual(a, b) {
  if (a.length !== b.length) return false;
  return a.every((c, i) => c.r === b[i].r && c.c === b[i].c);
}

export function reverseCells(cells) {
  return [...cells].reverse();
}
