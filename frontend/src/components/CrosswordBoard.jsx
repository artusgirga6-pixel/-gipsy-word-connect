import React, { useMemo } from "react";

/**
 * CrosswordBoard — renders the upper part of a Word Connect level: a vertical stack
 * of word slots, each consisting of N cells. Cells are revealed letter-by-letter as
 * the matching word is found.
 *
 * Visual variety (shape prop): different background motifs frame the slot stack.
 */
const SHAPE_STYLES = {
  rect:    { bg: "from-[#FFFBF0] to-[#F9F4E6]",   border: "border-[#E8DFCA]" },
  heart:   { bg: "from-[#FFF1F2] to-[#FFE4E6]",   border: "border-[#D92525]" },
  diamond: { bg: "from-[#EFF6FF] to-[#DBE7FE]",   border: "border-[#1E3A8A]" },
  plus:    { bg: "from-[#F0FDF4] to-[#DCFCE7]",   border: "border-[#2B8C44]" },
  rhombus: { bg: "from-[#FEF3C7] to-[#FDE68A]",   border: "border-[#F5A623]" },
  star:    { bg: "from-[#FAE8FF] to-[#F3D2FF]",   border: "border-[#7E22CE]" },
};

const SHAPE_ICON = {
  heart: "♥", diamond: "◆", plus: "✚", rhombus: "❖", star: "★", rect: "▦",
};

export default function CrosswordBoard({
  words,
  found,           // Set of words found so far
  revealedLetters, // Map: word → array of revealed indices (for hammer hint)
  shape = "rect",
}) {
  const s = SHAPE_STYLES[shape] || SHAPE_STYLES.rect;
  const maxLen = useMemo(() => Math.max(...words.map((w) => w.length), 1), [words]);

  return (
    <div
      className={[
        "relative w-full max-w-md mx-auto rounded-3xl border-4 p-4 sm:p-6 bg-gradient-to-br shadow-[0_8px_0_0_rgba(0,0,0,0.08)]",
        s.bg,
        s.border,
      ].join(" ")}
      data-testid="crossword-board"
    >
      <div className="absolute top-2 right-3 text-2xl opacity-30 pointer-events-none">
        {SHAPE_ICON[shape] || "▦"}
      </div>
      <div className="space-y-2 sm:space-y-3">
        {words.map((word) => {
          const isFound = found.has(word);
          const reveals = revealedLetters?.get(word) || new Set();
          return (
            <div
              key={word}
              className="flex justify-center gap-1.5 sm:gap-2"
              data-testid={`crossword-row-${word}`}
            >
              {word.split("").map((ch, i) => {
                const visible = isFound || reveals.has(i);
                return (
                  <div
                    key={i}
                    data-testid={`crossword-cell-${word}-${i}`}
                    className={[
                      "flex items-center justify-center font-black border-2 rounded-md transition-all",
                      "w-9 h-9 sm:w-11 sm:h-11 text-base sm:text-2xl",
                      visible
                        ? isFound
                          ? "bg-[#2B8C44] text-white border-[#1F6E33]"
                          : "bg-[#F5A623] text-white border-[#A36A00]"
                        : "bg-white/80 text-transparent border-[#5C4B4B]/30",
                    ].join(" ")}
                    style={{ fontFamily: "Fredoka, sans-serif" }}
                  >
                    {visible ? ch : "·"}
                  </div>
                );
              })}
              {/* Pad to maxLen for alignment when slots differ */}
              {Array.from({ length: Math.max(0, maxLen - word.length) }).map((_, i) => (
                <div key={`pad-${i}`} className="w-9 h-9 sm:w-11 sm:h-11" />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
