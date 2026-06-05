// Progressive Romani congratulation phrases by level range.
// Each entry maps a level threshold to a praise phrase.
// As the player advances, compliments grow stronger.

export const CONGRATS_PHRASES = [
  { min: 1, max: 9, phrase: "Lačhi goďi!", translation: "Bystrá mysl!" },
  { min: 10, max: 19, phrase: "Feder goďi!", translation: "Lepší mysl!" },
  { min: 20, max: 29, phrase: "Bareder goďi tut!", translation: "Větší mysl ti přeji!" },
  { min: 30, max: 39, phrase: "Šukar goďi avela!", translation: "Krásná mysl přichází!" },
  { min: 40, max: 49, phrase: "Zorali goďi tut!", translation: "Silná mysl tvá!" },
  { min: 50, max: 59, phrase: "Devleskeri goďi!", translation: "Boží mysl!" },
  { min: 60, max: 69, phrase: "Phurikani goďi!", translation: "Moudrá mysl předků!" },
  { min: 70, max: 79, phrase: "Romaňipenakeri goďi!", translation: "Mysl pravého romství!" },
  { min: 80, max: 89, phrase: "Baxtali goďi tut!", translation: "Šťastná mysl tvá!" },
  { min: 90, max: 99, phrase: "Baro than savorenge!", translation: "Velký mezi všemi!" },
  { min: 100, max: 100, phrase: "Najbareder goďi pe svetos!", translation: "Největší mysl na světě!" },
];

export function getCongrats(level) {
  for (const c of CONGRATS_PHRASES) {
    if (level >= c.min && level <= c.max) return c;
  }
  return CONGRATS_PHRASES[0];
}
