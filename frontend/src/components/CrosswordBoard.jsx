import React from "react";

/**
 * CrosswordBoard renders a shaped crossword. Cells outside the mask are decorative
 * (transparent). Cells inside the mask but unused by any placement render as
 * faint background squares; cells used by a word slot render as letter slots.
 *
 * Props:
 *  - board: { mask, placements, rows, cols }
 *  - found: Set<string> of found words
 *  - revealedLetters: Map<word, Set<index>> for hammer hints
 *  - shape: shape key (cosmetic)
 */
const SHAPE_THEME = {
  rect:    { bg: "from-[#FFFBF0] to-[#F9F4E6]", border: "border-[#E8DFCA]", icon: "▦" },
  heart:   { bg: "from-[#FFF1F2] to-[#FFE4E6]", border: "border-[#D92525]", icon: "♥" },
  diamond: { bg: "from-[#EFF6FF] to-[#DBE7FE]", border: "border-[#1E3A8A]", icon: "◆" },
  plus:    { bg: "from-[#F0FDF4] to-[#DCFCE7]", border: "border-[#2B8C44]", icon: "✚" },
  rhombus: { bg: "from-[#FEF3C7] to-[#FDE68A]", border: "border-[#F5A623]", icon: "❖" },
  star:    { bg: "from-[#FAE8FF] to-[#F3D2FF]", border: "border-[#7E22CE]", icon: "★" },
};

export default function CrosswordBoard({ board, found, revealedLetters, shape = "rect" }) {
  const t = SHAPE_THEME[shape] || SHAPE_THEME.rect;
  const { mask, placements, rows, cols } = board;

  // For each active mask cell, find which placement(s) own it and which letter index
  const cellInfo = new Map(); // key → {letter, words: [{word, index}]}
  for (const p of placements) {
    p.cells.forEach((cell, i) => {
      const key = `${cell.r},${cell.c}`;
      const entry = cellInfo.get(key) || { letter: p.word[i], words: [] };
      entry.letter = p.word[i];
      entry.words.push({ word: p.word, index: i });
      cellInfo.set(key, entry);
    });
  }

  // Adaptive cell size: bigger for smaller grids
  const dim = Math.max(rows, cols);
  const cellSizeCls = dim <= 7 ? "w-7 h-7 sm:w-9 sm:h-9" : "w-6 h-6 sm:w-7 sm:h-7";
  const textCls = dim <= 7 ? "text-base sm:text-xl" : "text-sm sm:text-base";

  return (
    <div
      className={[
        "relative w-full max-w-sm mx-auto rounded-3xl border-4 p-2.5 sm:p-4 bg-gradient-to-br shadow-[0_8px_0_0_rgba(0,0,0,0.08)]",
        t.bg, t.border,
      ].join(" ")}
      data-testid="crossword-board"
    >
      <div className="absolute top-2 right-3 text-2xl opacity-30 pointer-events-none">{t.icon}</div>
      <div
        className="grid mx-auto"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gap: "3px",
          width: "fit-content",
        }}
      >
        {mask.map((row, r) =>
          row.map((isActive, c) => {
            const key = `${r},${c}`;
            const info = cellInfo.get(key);
            if (!isActive) {
              return <div key={key} className={cellSizeCls} aria-hidden />;
            }
            if (!info) {
              // active but unused — decorative tile of the shape
              return (
                <div
                  key={key}
                  className={`${cellSizeCls} rounded-sm bg-white/30 border border-white/40`}
                  aria-hidden
                />
              );
            }
            // Cell belongs to one or more placements
            const isFoundAny = info.words.some((w) => found.has(w.word));
            const isRevealedAny = info.words.some((w) => {
              const r2 = revealedLetters?.get(w.word);
              return r2 && r2.has(w.index);
            });
            const visible = isFoundAny || isRevealedAny;
            return (
              <div
                key={key}
                data-testid={`crossword-cell-${r}-${c}`}
                data-cell-word={info.words.map((w) => w.word).join(",")}
                className={[
                  "flex items-center justify-center font-black border-2 rounded-md transition-all",
                  cellSizeCls,
                  textCls,
                  visible
                    ? isFoundAny
                      ? "bg-[#2B8C44] text-white border-[#1F6E33]"
                      : "bg-[#F5A623] text-white border-[#A36A00]"
                    : "bg-white text-transparent border-[#5C4B4B]/30",
                ].join(" ")}
                style={{ fontFamily: "Fredoka, sans-serif" }}
              >
                {visible ? info.letter : "·"}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
