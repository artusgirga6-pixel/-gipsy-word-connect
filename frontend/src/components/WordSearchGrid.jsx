import React, { useCallback, useMemo, useRef, useState } from "react";
import { lineBetween } from "@/lib/gridGenerator";

/**
 * WordSearchGrid
 * Renders an interactive N×N grid. Supports both pointer drag and tap-to-tap selection.
 * Calls onSelect(cells) when the user releases a valid line.
 */
export default function WordSearchGrid({
  grid,
  foundCells,
  highlightedCells = [],
  onSelect,
  disabled = false,
}) {
  const N = grid.length;
  const [start, setStart] = useState(null);
  const [current, setCurrent] = useState(null);
  const containerRef = useRef(null);
  const draggingRef = useRef(false);

  const activeCells = useMemo(() => {
    if (!start || !current) return [];
    return lineBetween(start, current) || [start];
  }, [start, current]);

  const cellKey = (r, c) => `${r},${c}`;
  const foundSet = useMemo(() => {
    const s = new Set();
    foundCells.forEach((c) => s.add(cellKey(c.r, c.c)));
    return s;
  }, [foundCells]);

  const highlightSet = useMemo(() => {
    const s = new Set();
    highlightedCells.forEach((c) => s.add(cellKey(c.r, c.c)));
    return s;
  }, [highlightedCells]);

  const activeSet = useMemo(() => {
    const s = new Set();
    activeCells.forEach((c) => s.add(cellKey(c.r, c.c)));
    return s;
  }, [activeCells]);

  // Pointer events
  const cellFromPointer = useCallback((e) => {
    const el = containerRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cellSize = rect.width / N;
    const c = Math.floor(x / cellSize);
    const r = Math.floor(y / cellSize);
    if (r < 0 || r >= N || c < 0 || c >= N) return null;
    return { r, c };
  }, [N]);

  const handlePointerDown = (e) => {
    if (disabled) return;
    e.preventDefault();
    const cell = cellFromPointer(e);
    if (!cell) return;
    draggingRef.current = true;
    setStart(cell);
    setCurrent(cell);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
  };

  const handlePointerMove = (e) => {
    if (!draggingRef.current) return;
    const cell = cellFromPointer(e);
    if (!cell) return;
    setCurrent(cell);
  };

  const handlePointerUp = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (start && current) {
      const line = lineBetween(start, current);
      if (line && line.length >= 2) {
        onSelect?.(line);
      }
    }
    setStart(null);
    setCurrent(null);
  };

  const handleCellClick = (r, c) => {
    if (disabled) return;
    // Tap-tap mode (for accessibility): first tap sets start, second tap completes
    if (!start) {
      setStart({ r, c });
      setCurrent({ r, c });
      return;
    }
    const line = lineBetween(start, { r, c });
    if (line && line.length >= 2) {
      onSelect?.(line);
    }
    setStart(null);
    setCurrent(null);
  };

  return (
    <div
      ref={containerRef}
      data-testid="word-search-grid"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="relative grid w-full max-w-2xl mx-auto select-none touch-none rounded-2xl border-4 border-[#E8DFCA] bg-[#F9F4E6] p-2 sm:p-3 shadow-[0_6px_0_0_#E8DFCA]"
      style={{ gridTemplateColumns: `repeat(${N}, minmax(0, 1fr))`, aspectRatio: "1 / 1" }}
    >
      {grid.map((row, r) =>
        row.map((letter, c) => {
          const key = cellKey(r, c);
          const isFound = foundSet.has(key);
          const isActive = activeSet.has(key);
          const isHinted = highlightSet.has(key);
          return (
            <div
              key={key}
              data-testid={`grid-tile-${r}-${c}`}
              onClick={() => handleCellClick(r, c)}
              className={[
                "flex items-center justify-center font-bold transition-colors",
                "text-[clamp(0.7rem,2.2vw,1.4rem)]",
                "rounded-md cursor-pointer",
                isFound ? "bg-[#2B8C44] text-white" : "",
                isActive && !isFound ? "bg-[#F5A623] text-white scale-105" : "",
                isHinted && !isFound && !isActive ? "ring-2 ring-[#D92525] ring-offset-1" : "",
                !isFound && !isActive ? "text-[#2D2323] hover:bg-white/70" : "",
              ].join(" ")}
            >
              {letter}
            </div>
          );
        })
      )}
    </div>
  );
}
