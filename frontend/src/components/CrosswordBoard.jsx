import React from "react";

/**
 * CrosswordBoard — renders word slots as individual floating rounded tiles
 * on top of the page background (no colored card wrapper). Matches the
 * Word Connect reference style.
 */
export default function CrosswordBoard({ board, found, revealedLetters, shape = "rect" }) {
  const { mask, placements, rows, cols } = board;

  // For each active mask cell, find which placement(s) own it
  const cellInfo = new Map();
  for (const p of placements) {
    p.cells.forEach((cell, i) => {
      const key = `${cell.r},${cell.c}`;
      const entry = cellInfo.get(key) || { letter: p.word[i], words: [] };
      entry.letter = p.word[i];
      entry.words.push({ word: p.word, index: i });
      cellInfo.set(key, entry);
    });
  }

  // Adaptive cell size
  const dim = Math.max(rows, cols);
  const cellPx = dim <= 7 ? 36 : dim <= 8 ? 32 : 28;

  return (
    <div
      className="w-full max-w-md mx-auto px-2"
      data-testid="crossword-board"
    >
      <div
        className="grid mx-auto"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, ${cellPx}px))`,
          gap: "4px",
          width: "fit-content",
        }}
      >
        {mask.map((row, r) =>
          row.map((isActive, c) => {
            const key = `${r},${c}`;
            const info = cellInfo.get(key);
            if (!isActive || !info) {
              // Inactive or unused → fully transparent space-holder
              return (
                <div
                  key={key}
                  style={{ width: cellPx, height: cellPx }}
                  aria-hidden
                />
              );
            }
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
                  "flex items-center justify-center font-black rounded-md transition-all",
                  visible
                    ? isFoundAny
                      ? "bg-white text-[#2D2323] shadow-[0_2px_4px_rgba(0,0,0,0.12)]"
                      : "bg-white text-[#A36A00] shadow-[0_2px_4px_rgba(0,0,0,0.12)]"
                    : "bg-white/85 backdrop-blur-sm shadow-[0_2px_4px_rgba(0,0,0,0.10)]",
                ].join(" ")}
                style={{
                  width: cellPx,
                  height: cellPx,
                  fontFamily: "Fredoka, sans-serif",
                  fontSize: cellPx * 0.55,
                }}
              >
                {visible ? info.letter : ""}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
