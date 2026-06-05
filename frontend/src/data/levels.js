// 30 levels of Romani Word Search.
// Each level defines grid size, themed Romani words and a hidden bonus phrase
// formed by the leftover (un-used) letters of the grid.

const stripDiacritics = (s) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const cleanPhrase = (phrase) =>
  stripDiacritics(phrase).toUpperCase().replace(/[^A-Z]/g, "");

const RAW_LEVELS = [
  {
    title: "Rodina",
    gridSize: 8,
    words: ["DAD", "DAJ", "PHEN", "CHAJ", "CHAVO", "ROMNI", "PHRAL", "KHER", "JAKH", "MARO"],
    phrase: "Miro grast chal kotor maro",
    translation: "Můj kůň ujídá kus chleba.",
  },
  {
    title: "Smích a rodina",
    gridSize: 8,
    words: ["BARI", "ROMNI", "ASAL", "DILINI", "DAJ", "PHEN", "CHAJ", "BACHT", "JILO", "BARO"],
    phrase: "Bari romni asal sar dilini",
    translation: "Velká Romka se směje jako bláznivá.",
  },
  {
    title: "Děda a vozík",
    gridSize: 8,
    words: ["PHURO", "DAD", "SOVEL", "PE", "VURDON", "PHEN", "BARO", "JILO", "AMEN", "AVRI"],
    phrase: "Phuro dad sovel pe vurdon",
    translation: "Starý táta spí na voze.",
  },
  {
    title: "Děti hrají",
    gridSize: 8,
    words: ["CIKNI", "CHAJ", "KHELEL", "BACHTALI", "CHAVO", "TIKNO", "KAMAV", "DAJ", "DAD"],
    phrase: "Cikni chaj khelel bachtali",
    translation: "Malá holčička šťastně tancuje.",
  },
  {
    title: "Boží most",
    gridSize: 8,
    words: ["DEVEL", "GRAJ", "PHURDO", "AVRI", "BARO", "JILO", "MARO", "BAVAL", "KHAM"],
    phrase: "Devleskoro grast praval phurdo",
    translation: "Boží kůň přeletí most.",
  },
  {
    title: "Oslava",
    gridSize: 9,
    words: ["ROMALEN", "PIJEN", "LACHO", "MOL", "PHRAL", "ROMNI", "BACHT", "GILI", "KHELAV", "JAKH", "MARO", "AMEN", "DAJ"],
    phrase: "Romalen pijen lacho mol",
    translation: "Romové pijí dobré víno.",
  },
  {
    title: "Sestřin chléb",
    gridSize: 9,
    words: ["PHEN", "KEREL", "MARO", "ANDRE", "KHER", "CHAJ", "ROMNI", "PHRAL", "BACHT", "JILO", "DAD", "DAJ", "AVRI", "KAMAV"],
    phrase: "Phen kerel maro andre kher",
    translation: "Sestra peče chléb v domě.",
  },
  {
    title: "Kostel štěstí",
    gridSize: 9,
    words: ["KHANGERI", "PHERDI", "BACHTALENCA", "DEVEL", "ROMALEN", "JILO", "PAKIV", "LACHO", "AMEN", "PHRAL"],
    phrase: "Khangeri pherdi bachtalenca",
    translation: "Kostel plný šťastných.",
  },
  {
    title: "Peníze",
    gridSize: 9,
    words: ["MANUSH", "MANGEL", "LOVE", "SAVOREN", "PHRAL", "ROMNI", "CHAVO", "BARO", "KAMAV", "DZAV", "JILO", "BACHT", "GAD"],
    phrase: "Manush mangel love savoren",
    translation: "Člověk chce peníze od všech.",
  },
  {
    title: "Dobrý rok",
    gridSize: 9,
    words: ["LACHO", "BERSH", "ANEL", "AMENGE", "DEVEL", "BACHT", "PHRAL", "ROMNI", "JAKH", "GILI", "KHELAV", "MARO", "PANI"],
    phrase: "Lacho bersh anel amenge",
    translation: "Dobrý rok nám přináší štěstí.",
  },
  {
    title: "Tanec bratra",
    gridSize: 10,
    words: ["MIRO", "PHRAL", "KEREL", "KHELIPEN", "GILI", "BASHAV", "ROMALEN", "BACHTALO", "ROMNI", "PHEN", "DAJ", "DAD", "JILO", "KAMAV", "JAKH", "AVRI"],
    phrase: "Miro phral kerel khelipen",
    translation: "Můj bratr pořádá tanec.",
  },
  {
    title: "Smích v domě",
    gridSize: 10,
    words: ["BACHTALO", "KHER", "PHERDO", "ASABEN", "ROMNI", "PHRAL", "DEVEL", "KAMAV", "JAKH", "JILO", "MARO", "PANI", "AMEN", "AVRI", "ANDRE", "BARO"],
    phrase: "Bachtalo kher pherdo asaben",
    translation: "Šťastný dům plný smíchu.",
  },
  {
    title: "Krásná píseň",
    gridSize: 10,
    words: ["ROMANES", "SUKAR", "BASHAV", "GILI", "ROMNI", "PHRAL", "BACHT", "AMEN", "JILO", "KHELAV", "DAJ", "DAD", "MARO", "PANI", "JAKH"],
    phrase: "Romanes sukar bashavel gili",
    translation: "Po romsky krásně hraje píseň.",
  },
  {
    title: "Kafe babičky",
    gridSize: 10,
    words: ["PHURI", "DAJ", "ZUMAVEL", "KAKAVI", "ROMNI", "PHEN", "PHRAL", "JILO", "MARO", "PANI", "BACHT", "KAMAV", "BARO", "AVRI", "ANDRE", "SUKAR"],
    phrase: "Phuri daj zumavel kakavi",
    translation: "Babička ochutnává kávu.",
  },
  {
    title: "Děti venku",
    gridSize: 10,
    words: ["CIKNE", "CHAVE", "KHELEN", "AVRI", "ROMNI", "PHRAL", "DEVEL", "BACHT", "MARO", "PANI", "JAKH", "JILO", "BARO", "KAMAV", "SUKAR", "ANDRE", "GILI"],
    phrase: "Cikne chave khelen avri",
    translation: "Malé děti si hrají venku.",
  },
  {
    title: "Práce",
    gridSize: 11,
    words: ["BUTI", "KERAV", "SARE", "DIVESA", "ROMNI", "PHRAL", "KHER", "MARO", "PANI", "BACHT", "JILO", "JAKH", "KAMAV", "DZAV", "AVRI", "ANDRE", "SUKAR", "LACHO", "BARO", "TIKNO", "GILI", "BASHAV"],
    phrase: "Buti kerav sare divesa",
    translation: "Pracuji všechny dny.",
  },
  {
    title: "Láska v očích",
    gridSize: 11,
    words: ["MIRE", "JAKHA", "DIKHEN", "TUT", "ROMNI", "PHRAL", "KAMAV", "JILO", "BACHT", "DEVEL", "MARO", "PANI", "SUKAR", "LACHO", "BARO", "TIKNO", "AVRI", "ANDRE", "GILI", "BASHAV", "AKANA", "KANA", "BERSH"],
    phrase: "Mire jakha dikhen tut",
    translation: "Moje oči tě vidí.",
  },
  {
    title: "Zdravá sestra",
    gridSize: 11,
    words: ["SASTI", "ZORALI", "PHEN", "MRI", "ROMNI", "PHRAL", "DEVEL", "BACHT", "JILO", "JAKH", "MARO", "PANI", "AKANA", "AVRI", "ANDRE", "KAMAV", "SUKAR", "LACHO", "BARO", "TIKNO", "DZAV", "BERSH"],
    phrase: "Sasti taj zorali phen mri",
    translation: "Zdravá a silná moje sestra.",
  },
  {
    title: "Modlitba",
    gridSize: 11,
    words: ["DEVLA", "DE", "AMEN", "BACHT", "ROMALEN", "DEVEL", "PAKIV", "JILO", "JAKH", "PHRAL", "ROMNI", "MARO", "PANI", "AKANA", "AVRI", "ANDRE", "KAMAV", "SUKAR", "LACHO", "BARO", "TIKNO", "GILI", "BASHAV", "KHELAV", "BERSH"],
    phrase: "Devla de amen bacht",
    translation: "Bože, dej nám štěstí.",
  },
  {
    title: "Romský jazyk",
    gridSize: 11,
    words: ["ROMANI", "CHIB", "SI", "SUKAR", "ROMALEN", "ROMNI", "PHRAL", "DEVEL", "BACHT", "JILO", "JAKH", "MARO", "PANI", "AKANA", "KAMAV", "LACHO", "BARO", "TIKNO", "AVRI", "ANDRE", "GILI", "BASHAV", "KHELAV", "BERSH"],
    phrase: "Romani chib si sukar",
    translation: "Romský jazyk je krásný.",
  },
  {
    title: "Kus chleba",
    gridSize: 12,
    words: ["PHURDE", "MANGE", "JEKH", "MANRO", "ROMNI", "PHRAL", "DEVEL", "BACHT", "ROMALEN", "JILO", "JAKH", "MARO", "PANI", "AKANA", "KAMAV", "SUKAR", "LACHO", "BARO", "TIKNO", "AVRI", "ANDRE", "GILI", "BASHAV", "KHELAV", "BERSH", "KHER", "DAJ", "DAD", "PHEN", "CHAVO"],
    phrase: "Phurde mange jekh manro",
    translation: "Podej mi jeden chleba.",
  },
  {
    title: "Král na voze",
    gridSize: 12,
    words: ["BESHAV", "PE", "VURDON", "SAR", "KRAJ", "ROMNI", "PHRAL", "DEVEL", "BACHT", "ROMALEN", "JILO", "JAKH", "MARO", "PANI", "AKANA", "KAMAV", "SUKAR", "LACHO", "BARO", "TIKNO", "AVRI", "ANDRE", "GILI", "BASHAV", "KHELAV", "BERSH", "KHER", "DAJ", "DAD", "PHEN"],
    phrase: "Beshav pe vurdon sar kraj",
    translation: "Sedím na voze jako král.",
  },
  {
    title: "Děti milují",
    gridSize: 12,
    words: ["MIRE", "CHAVE", "KAMEN", "AMENCA", "ROMNI", "PHRAL", "DEVEL", "BACHT", "ROMALEN", "JILO", "JAKH", "MARO", "PANI", "AKANA", "KAMAV", "SUKAR", "LACHO", "BARO", "TIKNO", "AVRI", "ANDRE", "GILI", "BASHAV", "KHELAV", "BERSH", "KHER", "DAJ", "DAD", "PHEN", "CHAJ", "CHAVO"],
    phrase: "Mire chave kamen amenca",
    translation: "Mé děti nás milují.",
  },
  {
    title: "Noční píseň",
    gridSize: 12,
    words: ["RATIATE", "KHELEN", "ROMORA", "GILI", "ROMNI", "PHRAL", "DEVEL", "BACHT", "ROMALEN", "JILO", "JAKH", "MARO", "PANI", "AKANA", "KAMAV", "SUKAR", "LACHO", "BARO", "TIKNO", "AVRI", "ANDRE", "BASHAV", "KHELAV", "BERSH", "KHER", "DAJ", "DAD", "PHEN", "CHAJ", "CHAVO"],
    phrase: "Ratiate khelen romora gili",
    translation: "V noci Romové zpívají píseň.",
  },
  {
    title: "Šťastná tanečnice",
    gridSize: 12,
    words: ["BACHTALI", "PHEN", "KHELORESTE", "ROMNI", "PHRAL", "DEVEL", "BACHT", "ROMALEN", "JILO", "JAKH", "MARO", "PANI", "AKANA", "KAMAV", "SUKAR", "LACHO", "BARO", "TIKNO", "AVRI", "ANDRE", "GILI", "BASHAV", "KHELAV", "BERSH", "KHER", "DAJ", "DAD", "CHAJ", "CHAVO", "MIRO"],
    phrase: "Bachtali phen kheloreste",
    translation: "Šťastná sestra na tanečnici.",
  },
  {
    title: "Respekt",
    gridSize: 13,
    words: ["PAKIV", "TUT", "AMARO", "PHRAL", "ROMNI", "DEVEL", "BACHT", "ROMALEN", "JILO", "JAKH", "MARO", "PANI", "AKANA", "KAMAV", "SUKAR", "LACHO", "BARO", "TIKNO", "AVRI", "ANDRE", "GILI", "BASHAV", "KHELAV", "BERSH", "KHER", "DAJ", "DAD", "PHEN", "CHAJ", "CHAVO", "MIRO", "ROMANI", "ROMANES", "MANGAV", "DIKHAV", "KAMASA"],
    phrase: "Pakiv tut amaro phral",
    translation: "Vážíme si tě, náš bratře.",
  },
  {
    title: "Nový rok",
    gridSize: 13,
    words: ["KANA", "AVELA", "BERSH", "NEVO", "ROMNI", "PHRAL", "DEVEL", "BACHT", "ROMALEN", "JILO", "JAKH", "MARO", "PANI", "AKANA", "KAMAV", "SUKAR", "LACHO", "BARO", "TIKNO", "AVRI", "ANDRE", "GILI", "BASHAV", "KHELAV", "KHER", "DAJ", "DAD", "PHEN", "CHAJ", "CHAVO", "MIRO", "ROMANI", "ROMANES", "MANGAV", "DIKHAV", "PAKIV"],
    phrase: "Kana avela bersh nevo",
    translation: "Až přijde nový rok.",
  },
  {
    title: "Požehnání",
    gridSize: 13,
    words: ["TE", "BACHTALJON", "SAVORE", "ROMORA", "ROMNI", "PHRAL", "DEVEL", "BACHT", "ROMALEN", "JILO", "JAKH", "MARO", "PANI", "AKANA", "KAMAV", "SUKAR", "LACHO", "BARO", "TIKNO", "AVRI", "ANDRE", "GILI", "BASHAV", "KHELAV", "BERSH", "KHER", "DAJ", "DAD", "PHEN", "CHAJ", "CHAVO", "MIRO", "ROMANI", "ROMANES", "MANGAV", "PAKIV"],
    phrase: "Te bachtaljon savore romora",
    translation: "Ať jsou všichni Romové šťastní.",
  },
  {
    title: "Boží štěstí",
    gridSize: 14,
    words: ["DEVLESKERE", "BACHT", "SAVORENCA", "ROMNI", "PHRAL", "DEVEL", "ROMALEN", "JILO", "JAKH", "MARO", "PANI", "AKANA", "KAMAV", "SUKAR", "LACHO", "BARO", "TIKNO", "AVRI", "ANDRE", "GILI", "BASHAV", "KHELAV", "BERSH", "KHER", "DAJ", "DAD", "PHEN", "CHAJ", "CHAVO", "MIRO", "ROMANI", "ROMANES", "MANGAV", "DIKHAV", "PAKIV", "KANA", "AVELA", "NEVO", "ZORALI", "SASTI", "MANGE", "MANRO"],
    phrase: "Devleskere bacht savorenca",
    translation: "Boží štěstí se všemi.",
  },
  {
    title: "Velké finále",
    gridSize: 15,
    words: ["ROMANIPEN", "BACHTALO", "DEVLESKERO", "ROMALENGE", "KHANGERI", "PHURIPEN", "ROMANES", "SUKARIPE", "BACHTALI", "ROMANI", "ROMNI", "PHRAL", "DEVEL", "BACHT", "ROMALEN", "JILO", "JAKH", "MARO", "PANI", "AKANA", "KAMAV", "SUKAR", "LACHO", "BARO", "TIKNO", "AVRI", "ANDRE", "GILI", "BASHAV", "KHELAV", "BERSH", "KHER", "DAJ", "DAD", "PHEN", "CHAJ", "CHAVO", "MIRO", "MANGAV", "DIKHAV", "PAKIV", "KANA", "AVELA", "NEVO", "ZORALI", "SASTI", "MANGE", "MANRO", "PHURDE", "DZAV"],
    phrase: "Vyhral si vyraindal meliari topánka",
    translation: "Vyhrál jsi! Vyraindal meliari topánka! (Speciální vítězná fráze)",
  },
];

// Auto-fit: keeps the word list within (gridSize^2 - phraseLetters) budget.
// Greedy preference for longer words to maximize density.
function fitWords(words, gridSize, phraseClean) {
  const budget = gridSize * gridSize - phraseClean.length;
  const unique = [...new Set(words.filter((w) => w.length <= gridSize && w.length >= 3))];
  unique.sort((a, b) => b.length - a.length);
  const picked = [];
  let sum = 0;
  for (const w of unique) {
    if (sum + w.length <= budget) {
      picked.push(w);
      sum += w.length;
    }
  }
  return picked;
}

export const LEVELS = RAW_LEVELS.map((lvl, idx) => {
  const phraseClean = cleanPhrase(lvl.phrase);
  return {
    ...lvl,
    id: idx + 1,
    phraseClean,
    words: fitWords(lvl.words, lvl.gridSize, phraseClean),
    isMilestone: (idx + 1) % 10 === 0,
    isFinal: idx === RAW_LEVELS.length - 1,
  };
});

export const TOTAL_LEVELS = LEVELS.length;
