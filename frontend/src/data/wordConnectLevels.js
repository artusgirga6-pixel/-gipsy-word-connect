// 25 Word Connect levels. Each level provides a curated letter pool. Words are
// auto-derived from the master Romani vocabulary so that level 1 has exactly
// 4 words totalling ≥16 crossword cells, and word counts/cells grow over time.

const MASTER_VOCAB = [
  // 3-letter
  "ROM","DAD","DAJ","KAM","MAR","DAR","RAT","KER","ZOR","BAR","KAN","MAS","MOL","NAM","RAS","TAR",
  "JEK","DUJ","TRI","BUT","MEK","JAJ","KAJ","AKO","RAI","JON","JIN","DOK",
  // 4-letter
  "ROMA","DROM","MARO","KHAM","KHER","KAMA","KANA","JAKH","JILO","CHAJ","CHIB","PHEN","KARO","AMEN",
  "MIRO","MORE","TUKE","DARA","RAMA","DOMA","KANI","KAMI","ZORI","BARI","BARO","TIKO","NEVO","SAVO",
  "ROMI","ROMI","KAVE","BAJA","DJIV","DROM","NAJI","RADO","KAMO","JANO",
  // 5-letter
  "AMARO","ROMNI","DEVEL","KAMAV","ROMAN","AKANA","TIKNO","MANGE","BACHT","ANDRE","LACHO","PHRAL",
  "CHAVO","KAMEN","ROMRA","DEVLA","SAVRE","BARJA","JIKHA",
  // 6-letter
  "ROMALE","ROMANI","DEVLES","BARVAL","MANUSH","SUKAR","ROMORA","DZUKEL","PHURDO","KHELDO","KAMAVA",
  // 7-letter
  "ROMANES","BAKHTAL","GILJAVA","DEVLESA","BACHTAL","KAMAVAS","ROMALEN",
  // 8-letter
  "ROMANIPE","BACHTALO","KHANGERI","PHURIPEN","PHRALIPE",
  // 9-letter
  "ROMANIPEN","ROMALENGE","DEVLESKERO","BACHTALIPE","PHRALIPEN",
];

function canForm(word, lettersStr) {
  const pool = lettersStr.split("");
  for (const ch of word.split("")) {
    const idx = pool.indexOf(ch);
    if (idx === -1) return false;
    pool.splice(idx, 1);
  }
  return true;
}

function subwords(pool, minLen = 3) {
  const seen = new Set();
  const out = [];
  for (const w of MASTER_VOCAB) {
    if (w.length < minLen || w.length > pool.length) continue;
    if (seen.has(w)) continue;
    if (canForm(w, pool)) { seen.add(w); out.push(w); }
  }
  return out.sort((a, b) => a.length - b.length || a.localeCompare(b));
}

// Pick `target` words preferring longer ones so total cell count grows.
function pickWords(pool, target, minTotalCells = 0) {
  const all = subwords(pool);
  if (all.length === 0) return [];
  // Sort longest first (more cells), tiebreak shortest if we already have enough cells
  const byLen = [...all].sort((a, b) => b.length - a.length);
  const picked = [];
  let cells = 0;
  for (const w of byLen) {
    if (picked.length >= target && cells >= minTotalCells) break;
    if (!picked.includes(w)) {
      picked.push(w);
      cells += w.length;
    }
  }
  // If we still under target word count, append shorter remaining words
  if (picked.length < target) {
    for (const w of all) {
      if (picked.length >= target) break;
      if (!picked.includes(w)) picked.push(w);
    }
  }
  return picked;
}

// 25 letter-pool definitions, each in a block of 5 with growing difficulty.
// Block 1 (lvl 1-5): 4 words.  Block 2 (11-15): 5.  Block 3 (21-25): 6.
// Block 4 (31-35): 7.  Block 5 (41-45): 8.
const POOLS = [
  // Block 1 — 4 words
  { letters: "DROMARO",  shape: "rect",    theme: "Drom" },         // L1: must give 4 words & ≥16 cells
  { letters: "ROMNIKA",  shape: "heart",   theme: "Romnika" },
  { letters: "DEVLESA",  shape: "diamond", theme: "Devel" },
  { letters: "KHERAMI",  shape: "rhombus", theme: "Kher" },
  { letters: "BACHTAR",  shape: "star",    theme: "Bacht" },

  // Block 2 — 5 words (lvl 11-15)
  { letters: "AMARODK",   shape: "heart",   theme: "Amaro" },
  { letters: "ROMNIKAL",  shape: "rect",    theme: "Romnikal" },
  { letters: "DEVLEKAR",  shape: "diamond", theme: "Devlekar" },
  { letters: "DEVLAMAR",  shape: "plus",    theme: "Devlamar" },
  { letters: "BACHTAROM", shape: "rhombus", theme: "Bachtarom" },

  // Block 3 — 6 words (lvl 21-25)
  { letters: "ROMALENA",   shape: "star",    theme: "Romalena" },
  { letters: "KAMAVELI",   shape: "heart",   theme: "Kamaveli" },
  { letters: "DROMALEN",   shape: "rect",    theme: "Dromalen" },
  { letters: "ROMANIPE",   shape: "diamond", theme: "Romanipe" },
  { letters: "BACHTAMIR",  shape: "plus",    theme: "Bachtamir" },

  // Block 4 — 7 words (lvl 31-35)
  { letters: "DEVLESKARI", shape: "heart",   theme: "Devleskari" },
  { letters: "KHANGERI",   shape: "diamond", theme: "Khangeri" },
  { letters: "ROMANIPEN",  shape: "star",    theme: "Romanipen" },
  { letters: "KAMAVASA",   shape: "plus",    theme: "Kamavas" },
  { letters: "PHURDOMAN",  shape: "rhombus", theme: "Phurdoman" },

  // Block 5 — 8 words (lvl 41-45)
  { letters: "BACHTALIPE",  shape: "heart",   theme: "Bachtalipe" },
  { letters: "ROMALENGE",   shape: "diamond", theme: "Romalenge" },
  { letters: "ROMALENDEV",  shape: "plus",    theme: "Romalendev" },
  { letters: "ROMANIPENA",  shape: "star",    theme: "Romanipena" },
  { letters: "PHRALIPENI",  shape: "rect",    theme: "Phralipen" },
];

function targetForBlock(blockIdx) {
  return 4 + blockIdx; // 4,5,6,7,8 by block 0..4
}

function minCellsForBlock(blockIdx) {
  return 16 + blockIdx * 4; // 16,20,24,28,32
}

export const WORD_CONNECT_LEVELS = POOLS.map((pool, i) => {
  const letters = pool.letters.toUpperCase();
  const blockIdx = Math.floor(i / 5);
  const targetWords = targetForBlock(blockIdx);
  const minCells = minCellsForBlock(blockIdx);
  const words = pickWords(letters, targetWords, minCells);
  return {
    type: "word_connect",
    sourceIndex: i,
    letters,
    words,
    shape: pool.shape,
    theme: pool.theme,
  };
});
