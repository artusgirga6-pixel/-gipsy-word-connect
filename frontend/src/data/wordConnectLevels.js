// 25 Word Connect levels — authentic Romani vocabulary supplied by the app
// owner. Each level guarantees a target word count that grows from 4 → 8 as
// difficulty rises. Pools were generated deterministically (see
// /tmp/gen_pools.js in the repo history) so the same pool/word set is shipped
// every build.
//
// Field shape per level:
//   letters : pool letters (uppercase, sorted) used to populate the wheel
//   words   : list of valid Romani subwords the player must find
//   shape   : crossword mask layout key (see /src/lib/shapeMasks.js)
//   theme   : anchor/title word displayed at the top of the level
//
// Diacritics are normalised: č→C, š→S, ž→Z, á/í/é/ú/ě/ů→A/I/E/U.

export const WORD_TRANSLATIONS = {
  BAL: "vlas", BAR: "kameň", DAD: "otec", DAJ: "mama", DAR: "strach",
  GAT: "košeľa", JAK: "oko", KAN: "ucho", LON: "soľ", ROM: "muž",
  KAJ: "kde", ROV: "plač", COR: "zlodej", MOL: "víno",
  VAST: "ruka", PHUV: "zem", THUL: "maslo", GOJA: "plnené črevá",
  BALO: "prasa", CAVO: "chlapec", CHON: "mesiac", CORO: "chudobný",
  DRAK: "hrozno", DROM: "cesta", GRAJ: "kôň", JILO: "srdce",
  KAST: "drevo", KALO: "čierny", LOLO: "červený", LOVE: "peniaze",
  MARO: "chlieb", PANI: "voda", SERO: "hlava", THUD: "mlieko",
  GULO: "sladký", DOMA: "doma", RADO: "rád", KHAM: "slnko",
  MACO: "ryba", SUNO: "sen", PHOR: "pero", MATO: "opitý",
  MACKA: "mačka", ROMNI: "žena", LINAJ: "leto", BAKRO: "baran",
  CHURI: "nôž", GADZO: "neróm", KHERE: "doma", KHERA: "domy",
  PHURI: "stará", PHURO: "starý", SUKAR: "pekný", BERSA: "roky",
  SASTO: "zdravý", PHRAL: "brat", CIKNO: "malý", JEVEN: "zima",
  LACHO: "dobrý", MANUS: "človek", PARNO: "biely", TERNO: "mladý",
  ROVEL: "plače", SOVEL: "spí", MARDO: "bitý", LACES: "páči sa",
  VUDAR: "dvere",
  MATORO: "opitý", MELALO: "špinavý", BESAVA: "bývam", MULORO: "duch",
  KORORO: "slepý", ASAVA: "smejem sa", ROVAVA: "plačem", KERAVA: "robím",
  TATORO: "teplučko", PINDRE: "nohy",
  BARVALO: "bohatý", CHAVORO: "dieťatko", DIKHAVA: "vidím",
  KHAMORO: "slniečko", MURSORO: "chlapček", SUMNAKO: "zlato",
  KANDINO: "smradľavý", SKAMIET: "stôl", PIJAKOS: "pijak",
  CIRIKLO: "vták", ROMNORI: "ženička",
  BACHTALO: "šťastný", TELEVIZA: "televízor",
  MURDARAV: "zabijem",
  NASVALIPEN: "choroby",
};

// Static level table — generated deterministically; never regenerated at runtime.
// Each level satisfies its target word count (4,4,4,4,4,5,5,5,5,5,6,6,6,6,6,7,7,7,7,7,8,8,8,8,8).
export const WORD_CONNECT_LEVELS = [
  // Block 1 — target 4 words
  { letters: "ADDKMOR",    words: ["DAD","DAR","ROM","DRAK","DROM","MARO","DOMA","RADO","MARDO"],          shape: "rect",    theme: "Drom" },
  { letters: "ADIJKLO",    words: ["DAJ","JAK","KAJ","JILO","KALO"],                                       shape: "heart",   theme: "Jilo" },
  { letters: "AADKMOR",    words: ["DAR","ROM","DRAK","DROM","MARO","DOMA","RADO","MARDO"],                shape: "diamond", theme: "Maro" },
  { letters: "ADKRSTV",    words: ["DAR","VAST","DRAK","KAST"],                                            shape: "rhombus", theme: "Vast" },
  { letters: "AADMOOR",    words: ["DAR","ROM","DROM","MARO","DOMA","RADO","MARDO"],                       shape: "star",    theme: "Mardo" },

  // Block 2 — target 5 words
  { letters: "ADIKMNOR",   words: ["DAR","KAN","ROM","DRAK","DROM","MARO","DOMA","RADO","ROMNI","MARDO"], shape: "heart",   theme: "Romni" },
  { letters: "ABDKKOOR",   words: ["BAR","DAR","DRAK","RADO","BAKRO"],                                     shape: "rect",    theme: "Bakro" },
  { letters: "ADDKLORS",   words: ["DAD","DAR","DRAK","KALO","RADO"],                                      shape: "diamond", theme: "Kalo" },
  { letters: "AABLORSV",   words: ["BAL","BAR","ROV","BALO","BARVALO"],                                    shape: "plus",    theme: "Barvalo" },
  { letters: "ADHKLOPR",   words: ["DAR","DRAK","KALO","RADO","PHOR","PHRAL"],                             shape: "rhombus", theme: "Phral" },

  // Block 3 — target 6 words
  { letters: "AACKMOOR",   words: ["ROM","COR","CORO","MARO","MACO","MACKA"],                              shape: "star",    theme: "Macka" },
  { letters: "ADKNORSU",   words: ["DAR","KAN","DRAK","RADO","SUNO","SUKAR"],                              shape: "heart",   theme: "Suno" },
  { letters: "AADGJORZ",   words: ["DAJ","DAR","GOJA","GRAJ","RADO","GADZO"],                              shape: "rect",    theme: "Gadzo" },
  { letters: "ADELLMOR",   words: ["DAR","ROM","MOL","DROM","MARO","DOMA","RADO","MARDO","MELALO"],       shape: "diamond", theme: "Melalo" },
  { letters: "ADDKMNOSU",  words: ["DAD","KAN","DOMA","SUNO","MANUS","SUMNAKO"],                           shape: "plus",    theme: "Sumnako" },

  // Block 4 — target 7 words
  { letters: "AABKKLORV",  words: ["BAL","BAR","ROV","BALO","KALO","BAKRO","BARVALO"],                     shape: "heart",   theme: "Barvalo" },
  { letters: "ACDHKOORV",  words: ["DAR","ROV","COR","CAVO","CORO","DRAK","RADO","CHAVORO"],               shape: "diamond", theme: "Chavoro" },
  { letters: "ADHKKMOOR",  words: ["DAR","ROM","DRAK","DROM","MARO","DOMA","RADO","KHAM","MARDO","KHAMORO"], shape: "star", theme: "Khamoro" },
  { letters: "AADMOOORT",  words: ["DAR","ROM","DROM","MARO","DOMA","RADO","MATO","MARDO","MATORO"],       shape: "plus",    theme: "Matoro" },
  { letters: "ACDIKNNOR",  words: ["DAR","KAN","COR","DRAK","RADO","CIKNO","KANDINO"],                     shape: "rhombus", theme: "Kandino" },

  // Block 5 — target 8 words
  { letters: "AABCDHLMOT", words: ["BAL","MOL","BALO","DOMA","MACO","MATO","LACHO","BACHTALO"],            shape: "heart",   theme: "Bachtalo" },
  { letters: "AADMOORUV",  words: ["DAR","ROM","ROV","DROM","MARO","DOMA","RADO","MARDO","VUDAR"],         shape: "diamond", theme: "Vudar" },
  { letters: "AADMORRUV",  words: ["DAR","ROM","ROV","DROM","MARO","DOMA","RADO","MARDO","VUDAR","MURDARAV"], shape: "plus", theme: "Murdarav" },
  { letters: "AADDMORSS",  words: ["DAD","DAR","ROM","DROM","MARO","DOMA","RADO","MARDO"],                 shape: "star",    theme: "Mardo veľký" },
  { letters: "ADDEKLORSV", words: ["DAD","DAR","ROV","DRAK","KALO","LOVE","SERO","RADO","ROVEL","SOVEL"], shape: "rect",    theme: "Rovel" },
];
