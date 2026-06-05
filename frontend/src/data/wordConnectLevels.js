// 50 Word Connect levels. Each level provides:
//  - letters: pool of letters shown in the circle (may contain duplicates)
//  - words: list of valid Romani words formable from the pool
//  - shape: visual decoration kind for the crossword card
//  - theme: short Romani title (lowercase ok)
//
// Difficulty grows: shorter pools early → longer pools at the end.

export const WORD_CONNECT_POOLS = [
  // ---- Levels 1-5 ----
  { letters: "DAJ",    words: ["DAJ"], shape: "rect",    theme: "Daj" },
  { letters: "DAD",    words: ["DAD"], shape: "heart",   theme: "Dad" },
  { letters: "KAM",    words: ["KAM"], shape: "diamond", theme: "Kam" },
  { letters: "KHER",   words: ["KHER"], shape: "rhombus", theme: "Kher" },
  { letters: "CHAJ",   words: ["CHAJ"], shape: "star",   theme: "Čhaj" },
  // ---- Levels 11-15 ----
  { letters: "MARO",   words: ["MARO"], shape: "heart",  theme: "Maro" },
  { letters: "BARO",   words: ["BAR", "BARO"], shape: "rect",  theme: "Baro" },
  { letters: "JILO",   words: ["JILO"], shape: "diamond", theme: "Jilo" },
  { letters: "JAKH",   words: ["JAKH"], shape: "plus",   theme: "Jakh" },
  { letters: "PHEN",   words: ["PHEN"], shape: "rhombus", theme: "Phen" },
  // ---- Levels 21-25 ----
  { letters: "BACHT",  words: ["BACHT"], shape: "star",   theme: "Bacht" },
  { letters: "PHRAL",  words: ["PHRAL"], shape: "heart",  theme: "Phral" },
  { letters: "ROMNI",  words: ["ROM", "ROMNI"], shape: "diamond", theme: "Romni" },
  { letters: "CHAVO",  words: ["CHAVO"], shape: "rect",   theme: "Čhavo" },
  { letters: "DEVEL",  words: ["DEVEL"], shape: "plus",   theme: "Devel" },
  // ---- Levels 31-35 ----
  { letters: "KAMAV",  words: ["KAM", "KAMAV"], shape: "heart",   theme: "Kamav" },
  { letters: "MANRO",  words: ["MARO", "MANRO"], shape: "star",    theme: "Manro" },
  { letters: "PANI",   words: ["PANI"], shape: "diamond", theme: "Pani" },
  { letters: "DROM",   words: ["ROM", "DROM"], shape: "rect",   theme: "Drom" },
  { letters: "LACHO",  words: ["LACHO"], shape: "rhombus", theme: "Lačho" },
  // ---- Levels 41-45 ----
  { letters: "ROMALE", words: ["ROM", "ROMALE"], shape: "heart",  theme: "Romale" },
  { letters: "MANGEL", words: ["MANGE", "MANGEL"], shape: "star",   theme: "Mangel" },
  { letters: "KAKAVI", words: ["KAK", "KAKAVI"], shape: "diamond", theme: "Kakavi" },
  { letters: "AKANA",  words: ["KANA", "AKANA"], shape: "plus",   theme: "Akana" },
  { letters: "BARVAL", words: ["BAR", "BARVAL"], shape: "rect",   theme: "Barval" },
  // ---- Levels 51-55 ----
  { letters: "ROMANI", words: ["ROM", "ROMA", "ROMANI"], shape: "heart",  theme: "Romani" },
  { letters: "AVRI",   words: ["AVRI"], shape: "diamond", theme: "Avri" },
  { letters: "ANDRE",  words: ["ANDRE"], shape: "plus",   theme: "Andre" },
  { letters: "ZORALI", words: ["ZOR", "ZORALI"], shape: "star",   theme: "Zorali" },
  { letters: "DZUKEL", words: ["DZUKEL"], shape: "rhombus", theme: "Džukel" },
  // ---- Levels 61-65 ----
  { letters: "PHURDO",  words: ["PHURDO"], shape: "heart",  theme: "Phurdo" },
  { letters: "BACHTAL", words: ["BACHT", "BACHTAL"], shape: "diamond", theme: "Bachtal" },
  { letters: "ROMORA",  words: ["ROM", "ROMA", "ROMORA"], shape: "star", theme: "Romora" },
  { letters: "KHELDI",  words: ["KHEL", "KHELDI"], shape: "plus", theme: "Kheldi" },
  { letters: "GILJAVA", words: ["GIL", "GILJAVA"], shape: "rect",   theme: "Giljava" },
  // ---- Levels 71-75 ----
  { letters: "KAMAVAS",  words: ["KAM", "KAMAV", "KAMAVAS"], shape: "heart",   theme: "Kamavas" },
  { letters: "BACHTALO", words: ["BACHT", "BACHTAL", "BACHTALO"], shape: "diamond", theme: "Bachtalo" },
  { letters: "KHANGERI", words: ["KAN", "KHANGERI"], shape: "star", theme: "Khangeri" },
  { letters: "ROMANIPE", words: ["ROM", "ROMANI", "ROMANIPE"], shape: "plus", theme: "Romanipe" },
  { letters: "DEVLESA",  words: ["DEVEL", "DEVLESA"], shape: "rhombus", theme: "Devlesa" },
  // ---- Levels 81-85 ----
  { letters: "MANUSHA",  words: ["MANUS", "MANUSHA"], shape: "heart", theme: "Manuša" },
  { letters: "ROMALEN",  words: ["ROM", "ROMA", "ROMALE", "ROMALEN"], shape: "diamond", theme: "Romalen" },
  { letters: "PHURIPEN", words: ["PHUR", "PHURIPEN"], shape: "star",  theme: "Phuripen" },
  { letters: "GILAVIPE", words: ["GIL", "GILAV", "GILAVIPE"], shape: "plus",  theme: "Gilavipe" },
  { letters: "KAMASA",   words: ["KAM", "KAMAS", "KAMASA"], shape: "rect",  theme: "Kamasa" },
  // ---- Levels 91-95 ----
  { letters: "ROMANIPEN",  words: ["ROM", "ROMANI", "ROMANIPE", "ROMANIPEN"], shape: "heart",  theme: "Romanipen" },
  { letters: "DEVLESKERO", words: ["DEVEL", "DEVLES", "DEVLESKERO"], shape: "diamond", theme: "Devleskero" },
  { letters: "BACHTALIPE", words: ["BACHT", "BACHTAL", "BACHTALIPE"], shape: "star",   theme: "Bachtalipe" },
  { letters: "PHRALIPEN",  words: ["PHRAL", "PHRALIPEN"], shape: "plus", theme: "Phralipen" },
  { letters: "ROMALENGE",  words: ["ROM", "ROMA", "ROMALE", "ROMALENGE"], shape: "rhombus", theme: "Romalenge" },
];

// Filter: words must be formable from the letters pool (each letter used at most as many times as available).
function canForm(word, lettersStr) {
  const pool = lettersStr.split("");
  for (const ch of word.split("")) {
    const idx = pool.indexOf(ch);
    if (idx === -1) return false;
    pool.splice(idx, 1);
  }
  return true;
}

// Sanitize the pools (drop any words that can't be formed from the letters).
export const WORD_CONNECT_LEVELS = WORD_CONNECT_POOLS.map((pool, i) => {
  const letters = pool.letters.toUpperCase();
  const words = [...new Set(pool.words.map((w) => w.toUpperCase()))]
    .filter((w) => canForm(w, letters))
    .sort((a, b) => a.length - b.length); // shortest first for crossword stacking
  return {
    type: "word_connect",
    sourceIndex: i,
    letters,
    words,
    shape: pool.shape,
    theme: pool.theme,
  };
});
