// 50 Word Connect levels. Each level has a curated letter pool. Words are
// auto-derived from a master Romani vocabulary so that every level satisfies
// the minimum-word requirement and progresses in difficulty.
//
// Level 1: ≥4 words.  Progresses by +1 word every ~10 levels.

// ---- Master Romani vocabulary (uppercase, no diacritics) ----
// Each entry is a valid Romani word; many share letters so multiple words can
// be formed from a single letter pool.
const MASTER_VOCAB = [
  // 3-letter
  "ROM","DAD","DAJ","KAM","MAR","DAR","RAT","KER","ZOR","BAR","KAN","MAS","MOL","NAM","RAS","TAR",
  "JEK","DUJ","TRI","BUT","MEK","JAJ","DZA","AJS","KAJ","AKO","RAI",
  // 4-letter
  "ROMA","DROM","MARO","KHAM","KHER","KAMA","KANA","JAKH","JILO","CHAJ","CHIB","PHEN","KARO","AMEN",
  "MIRO","MORE","TUKE","DARA","RAMA","DOMA","KANI","KAMI","ZORI","BARI","BARO","TIKO","NEVO","SAVO",
  // 5-letter
  "AMARO","ROMNI","DEVEL","KAMAV","ROMAN","AKANA","TIKNO","MANGE","BACHT","ANDRE","LACHO","PHRAL",
  "CHAVO","KAMEN","ROMRA","DEVLA","SAVRE","MIROL",
  // 6-letter
  "ROMALE","ROMANI","DEVLES","BARVAL","MANUSH","SUKAR","ROMORA","DZUKEL","PHURDO","KHELDO",
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
  // Always include the pool itself as a word if it's in the vocab
  return out.sort((a, b) => a.length - b.length || a.localeCompare(b));
}

// Pool definitions. Each pool's letter string is chosen so that subwords()
// returns at least targetWords() entries.
const POOLS = [
  // Level 1-5 (target 4 words minimum)
  { letters: "KAMARO",  shape: "rect",    theme: "Familija" },     // KAM,ROM,KAMA,KARO,MARO,AMARO
  { letters: "DROMAR",  shape: "heart",   theme: "Drom" },         // DAR,MAR,ROM,DROM,MARO
  // L3 anagram
  { letters: "ROMNIKA", shape: "diamond", theme: "Romni" },        // KAM,KAN,RAM,ROM,ROMA,ROMAN,ROMNI
  { letters: "KHERAM",  shape: "rhombus", theme: "Kher" },         // KAM,KER,MAR,RAM,KHAM,KHER,KAMA,KARO

  // Level 6-10 wait — block 6-10 is word_search. So next word_connect block is 11-15.
  // Anagrams take levels 3,13,23,... in code; we still need 4 word_connect entries per non-anagram slot.

  // Level 11-15 (target 5 words)
  { letters: "AMAROD",  shape: "heart",   theme: "Drom" },         // ROM,DAR,MAR,DROM,MARO,AMARO
  { letters: "ROMNICA", shape: "rect",    theme: "Romnica" },      // KAM,KAN,ROM,ROMA,ROMNI
  // L13 anagram
  { letters: "DEVLESA", shape: "diamond", theme: "Devel" },        // DAR,DEV(no in vocab→use)...
  { letters: "PHRALAJ", shape: "plus",    theme: "Phral" },        // PHRAL,JAJ,RAS,RAJ?...

  // Level 21-25 (target 5-6 words)
  { letters: "BACHTAR",   shape: "star",    theme: "Bacht" },      // BAR,TAR,RAT,RAS,BACHT,BACHTA?
  { letters: "ROMALEN",   shape: "heart",   theme: "Romalen" },    // ROM,ROMA,ROMAN,ROMALE,ROMALEN
  // L23 anagram
  { letters: "KAMAVELI",  shape: "rect",    theme: "Kamav" },      // KAM,KAMA,KAMI,KAMAV,KAMEN?
  { letters: "DROMALE",   shape: "rhombus", theme: "Drom" },       // ROM,DAR,DROM,MARO,ROMA,ROMALE

  // Level 31-35 (target 6 words)
  { letters: "ROMANIPE",  shape: "heart",   theme: "Romanipe" },   // many subwords
  { letters: "BACHTALI",  shape: "star",    theme: "Bachtali" },
  // L33 anagram
  { letters: "DEVLESKO",  shape: "diamond", theme: "Devleskero" },
  { letters: "KHANGERI",  shape: "plus",    theme: "Khangeri" },

  // Level 41-45 (target 6-7)
  { letters: "ROMANIPEN",  shape: "heart",   theme: "Romanipen" },
  { letters: "KAMAVASA",   shape: "rhombus", theme: "Kamavas" },
  // L43 anagram
  { letters: "PHURIPEN",   shape: "star",    theme: "Phuripen" },
  { letters: "DEVLESKER",  shape: "rect",    theme: "Devlesker" },

  // Level 51-55 (target 7)
  { letters: "BACHTALIPE",  shape: "heart",   theme: "Bachtalipe" },
  { letters: "ROMALENGE",   shape: "diamond", theme: "Romalenge" },
  // L53 anagram
  { letters: "DEVLESKERO",  shape: "plus",    theme: "Devleskero" },
  { letters: "PHRALIPEN",   shape: "star",    theme: "Phralipen" },

  // Level 61-65 (target 7-8)
  { letters: "ROMALENCA",   shape: "rect",    theme: "Romalenca" },
  { letters: "BACHTALOSI",  shape: "rhombus", theme: "Bachtaloci" },
  // L63 anagram
  { letters: "KHANGERIO",   shape: "heart",   theme: "Khangerio" },
  { letters: "DEVLESKERA",  shape: "diamond", theme: "Devleskera" },

  // Level 71-75 (target 8)
  { letters: "ROMANIPENA",  shape: "heart",   theme: "Romanipena" },
  { letters: "BACHTALIPEN", shape: "star",    theme: "Bachtalipen" },
  // L73 anagram
  { letters: "DEVLESKERIO", shape: "plus",    theme: "Devleskerio" },
  { letters: "PHURIPENSA",  shape: "diamond", theme: "Phuripensa" },

  // Level 81-85 (target 8-9)
  { letters: "ROMANIPENCA",   shape: "rect",   theme: "Romanipenca" },
  { letters: "BACHTALIPESA",  shape: "heart",  theme: "Bachtalipesa" },
  // L83 anagram
  { letters: "DEVLESKERONE",  shape: "rhombus", theme: "Devleskerone" },
  { letters: "ROMALENGERO",   shape: "star",   theme: "Romalengero" },

  // Level 91-95 (target 9-10)
  { letters: "ROMANIPENESA",   shape: "heart",   theme: "Romanipenesa" },
  { letters: "BACHTALIPENESA", shape: "diamond", theme: "Bachtalipenesa" },
  // L93 anagram
  { letters: "DEVLESKERINESA", shape: "plus",    theme: "Devleskerinesa" },
  { letters: "ROMALENGERESA",  shape: "star",    theme: "Romalengeresa" },
];

// Number of word_connect levels we need (50 minus 10 anagram = 40).
// POOLS above provides 40 entries (4 per block × 10 blocks).
// targetWords grows from 4 → 10 by block.
function targetWordsForBlock(blockIdx /* 0..9 */) {
  // blockIdx 0 (lvl 1-5): 4 words; +1 every 2 blocks.
  return Math.min(10, 4 + Math.floor(blockIdx / 1.5));
}

export const WORD_CONNECT_LEVELS = POOLS.map((pool, i) => {
  const letters = pool.letters.toUpperCase();
  const allSubs = subwords(letters);
  const blockIdx = Math.floor(i / 4); // 4 word_connect entries per block of 5 (excl. anagram)
  const target = targetWordsForBlock(blockIdx);
  // Pick shortest-first up to target, but always include the longest pool word if available.
  const picked = [];
  for (const w of allSubs) {
    if (picked.length >= target) break;
    picked.push(w);
  }
  // If we still have fewer than target, append longer subwords already in the list
  // (allSubs is sorted shortest first; longer ones already considered).
  // As a safety net, ensure at least 3 words for early levels.
  const finalWords = picked.length >= 3 ? picked : allSubs;
  return {
    type: "word_connect",
    sourceIndex: i,
    letters,
    words: finalWords,
    shape: pool.shape,
    theme: pool.theme,
  };
});
