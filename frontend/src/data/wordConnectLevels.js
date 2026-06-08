// 25 Word Connect levels — using the authentic Romani vocabulary supplied by
// the app owner. All diacritics are normalised to ASCII uppercase for puzzle
// cells (display layer can still render the original orthography for hints).

// ---- Master Romani vocabulary (uppercase, no diacritics) ----
// č→C, š→S, ž→Z, ť/ď→T/D, á/í/é/ú→A/I/E/U.  Verified against owner-supplied list.
const MASTER_VOCAB = [
  // 3-letter
  "BAL","BAR","DAD","DAJ","DAR","GAT","JAK","KAN","LON","ROM","KAJ","ROV","COR","MOL",
  // 4-letter
  "VAST","PHUV","THUL","GOJA","BALO","CAVO","CHON","CORO","DRAK","DROM","GRAJ","JILO",
  "KAST","KALO","LOLO","LOVE","MARO","PANI","SERO","THUD","GULO","DOMA","RADO","KHAM",
  "MACO","SUNO","PHOR","MATO",
  // 5-letter
  "MACKA","ROMNI","LINAJ","BAKRO","CHURI","GADZO","KHERE","KHERA","PHURI","PHURO",
  "SUKAR","BERSA","SASTO","PHRAL","CIKNO","JEVEN","LACHO","MANUS","PARNO","TERNO",
  "ROVEL","SOVEL","MARDO","LACES","VUDAR","HUNDRY",
  // 6-letter
  "MATORO","MELALO","ROMNORI","COROR0","BESAVA","MULORO","KORORO","ASAVA","ROVAVA",
  "KERAVA","TATORO","PINDRE","VASTA",
  // 7-letter
  "BARVALO","CHAVORO","DIKHAVA","KHAMORO","MURSORO","SUMNAKO","KANDINO","SKAMIET",
  "PIJAKOS","CIRIKLO",
  // 8-letter
  "BACHTALO","TELEVIZA",
  // 9-letter
  "MURDARAV",
  // 11-letter
  "NASVALIPEN",
];

// Slovak translations for hint/popup display (optional UI use)
export const WORD_TRANSLATIONS = {
  BAL:"vlas",BAR:"kameň",DAD:"otec",DAJ:"mama",DAR:"strach",GAT:"košeľa",JAK:"oko",
  KAN:"ucho",LON:"soľ",ROM:"muž",KAJ:"kde",ROV:"plač",COR:"zlodej",MOL:"víno",
  VAST:"ruka",PHUV:"zem",THUL:"maslo",GOJA:"plnené črevá",BALO:"prasa",CAVO:"chlapec",
  CHON:"mesiac",CORO:"chudobný",DRAK:"hrozno",DROM:"cesta",GRAJ:"kôň",JILO:"srdce",
  KAST:"drevo",KALO:"čierny",LOLO:"červený",LOVE:"peniaze",MARO:"chlieb",PANI:"voda",
  SERO:"hlava",THUD:"mlieko",GULO:"sladký",DOMA:"doma",RADO:"rád",KHAM:"slnko",
  MACO:"ryba",SUNO:"sen",PHOR:"pero",MATO:"opitý",MACKA:"mačka",ROMNI:"žena",
  LINAJ:"leto",BAKRO:"baran",CHURI:"nôž",GADZO:"neróm",KHERE:"doma",KHERA:"domy",
  PHURI:"stará",PHURO:"starý",SUKAR:"pekný",BERSA:"roky",SASTO:"zdravý",PHRAL:"brat",
  CIKNO:"malý",JEVEN:"zima",LACHO:"dobrý",MANUS:"človek",PARNO:"biely",TERNO:"mladý",
  ROVEL:"plače",SOVEL:"spí",MARDO:"bitý",LACES:"páči sa",VUDAR:"dvere",HUNDRY:"oblečenie",
  MATORO:"opitý",MELALO:"špinavý",BARVALO:"bohatý",CHAVORO:"dieťatko",DIKHAVA:"vidím",
  KHAMORO:"slniečko",MURSORO:"chlapček",ROMNORI:"ženička",BESAVA:"bývam",MULORO:"duch",
  KORORO:"slepý",ASAVA:"smejem sa",ROVAVA:"plačem",KERAVA:"robím",TATORO:"teplučko",
  PINDRE:"nohy",VASTA:"ruky",SUMNAKO:"zlato",KANDINO:"smradľavý",SKAMIET:"stôl",
  PIJAKOS:"pijak",CIRIKLO:"vták",BACHTALO:"šťastný",TELEVIZA:"televízor",
  MURDARAV:"zabijem",NASVALIPEN:"choroby",NASVALO:"chorý",
};

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

// Tracks words used so far so each level prefers fresh vocabulary, but words
// can still repeat across levels when needed to meet the target count.
const _usedAcrossLevels = new Set();

function pickWords(pool, targetCount, minCells) {
  const all = subwords(pool);
  const fresh = all.filter((w) => !_usedAcrossLevels.has(w))
                   .sort((a, b) => b.length - a.length);
  const stale = all.filter((w) => _usedAcrossLevels.has(w))
                   .sort((a, b) => b.length - a.length);
  const picked = [];
  let cells = 0;
  // Pass 1: fresh words, longest first, up to target
  for (const w of fresh) {
    if (picked.length >= targetCount && cells >= minCells) break;
    picked.push(w); cells += w.length;
  }
  // Pass 2: if we don't have enough yet, allow stale (repeat) words
  for (const w of stale) {
    if (picked.length >= targetCount && cells >= minCells) break;
    if (!picked.includes(w)) { picked.push(w); cells += w.length; }
  }
  picked.forEach((w) => _usedAcrossLevels.add(w));
  return picked;
}

// 25 pools, 5-per-block, growing target words 4→8 and growing min cells.
const POOLS = [
  // Block 1 (lvl 1-5) — target 4 words, ≥16 cells
  { letters: "DROMARO",   shape: "rect",    theme: "Drom" },
  { letters: "JILOKHAM",  shape: "heart",   theme: "Jilo" },
  { letters: "MARODKAJ",  shape: "diamond", theme: "Maro" },
  { letters: "VASTAROM",  shape: "rhombus", theme: "Vast" },
  { letters: "MARDOLAC",  shape: "star",    theme: "Mardo" },

  // Block 2 (lvl 11-15) — target 5 words
  { letters: "ROMNIKAJ",   shape: "heart",   theme: "Romni" },
  { letters: "BAKROCAV",   shape: "rect",    theme: "Bakro" },
  { letters: "DROMVAST",   shape: "diamond", theme: "Drom" },
  { letters: "BARVALCO",   shape: "plus",    theme: "Barvalo" },
  { letters: "PHRALCHO",   shape: "rhombus", theme: "Phral" },

  // Block 3 (lvl 21-25) — target 6 words
  { letters: "MACKAROV",    shape: "star",    theme: "Macka" },
  { letters: "DARASUNO",    shape: "heart",   theme: "Suno" },
  { letters: "GADZOMAR",    shape: "rect",    theme: "Gadzo" },
  { letters: "MELALORO",    shape: "diamond", theme: "Melalo" },
  { letters: "SUMNAKOR",    shape: "plus",    theme: "Sumnako" },

  // Block 4 (lvl 31-35) — target 7 words
  { letters: "BARVALOC",    shape: "heart",   theme: "Barvalo" },
  { letters: "CHAVORIM",    shape: "diamond", theme: "Chavoro" },
  { letters: "KHAMOROS",    shape: "star",    theme: "Khamoro" },
  { letters: "SKAMIETR",    shape: "plus",    theme: "Skamiet" },
  { letters: "KANDINOR",    shape: "rhombus", theme: "Kandino" },

  // Block 5 (lvl 41-45) — target 8 words
  { letters: "BACHTALO",     shape: "heart",   theme: "Bachtalo" },
  { letters: "TELEVIZA",     shape: "diamond", theme: "Televiza" },
  { letters: "MURDARAV",     shape: "plus",    theme: "Murdarav" },
  { letters: "DIKHAVAS",     shape: "star",    theme: "Dikhava" },
  { letters: "NASVALIPEN",   shape: "rect",    theme: "Nasvalipen" },
];

function targetForBlock(b) { return 4 + b; }       // 4,5,6,7,8
function minCellsForBlock(b) { return 16 + b * 4; } // 16,20,24,28,32

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
