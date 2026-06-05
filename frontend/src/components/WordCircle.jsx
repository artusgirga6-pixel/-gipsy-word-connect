import React, { useMemo, useRef, useState, useCallback } from "react";

/**
 * WordCircle — letters arranged on a circle. Player drags from letter to letter to
 * form a word. Calls onSubmit(word) when the pointer is released.
 *
 * Props:
 *  - letters: string[] (one entry per slot, may have duplicates)
 *  - onSubmit(word: string)
 *  - disabled: boolean
 */
export default function WordCircle({ letters, onSubmit, disabled }) {
  const N = letters.length;
  const containerRef = useRef(null);
  const [selected, setSelected] = useState([]); // indices into letters
  const [pointerPos, setPointerPos] = useState(null);
  const draggingRef = useRef(false);
  const pointerStartRef = useRef(null);

  const size = 320;
  const cx = size / 2;
  const cy = size / 2;
  const ringR = size / 2 - 38;
  const letterR = N <= 4 ? 30 : N <= 6 ? 26 : 22;

  const positions = useMemo(() => {
    return letters.map((_, i) => {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / N;
      return {
        x: cx + ringR * Math.cos(angle),
        y: cy + ringR * Math.sin(angle),
      };
    });
  }, [N, letters, cx, cy, ringR]);

  const getIdxAt = useCallback(
    (clientX, clientY) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return -1;
      const x = ((clientX - rect.left) / rect.width) * size;
      const y = ((clientY - rect.top) / rect.height) * size;
      for (let i = 0; i < N; i++) {
        const { x: lx, y: ly } = positions[i];
        const dx = x - lx;
        const dy = y - ly;
        if (Math.sqrt(dx * dx + dy * dy) <= letterR) return i;
      }
      return -1;
    },
    [N, positions, letterR]
  );

  const finish = useCallback(() => {
    if (selected.length > 0) {
      const word = selected.map((i) => letters[i]).join("");
      if (word.length >= 2) onSubmit?.(word);
    }
    setSelected([]);
    setPointerPos(null);
    draggingRef.current = false;
  }, [selected, letters, onSubmit]);

  const handlePointerDown = (e) => {
    if (disabled) return;
    // Don't seize selection on press — wait for actual movement.
    // This lets <g> children's onClick handle tap-to-tap correctly.
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    draggingRef.current = false;
    setPointerPos(null);
  };

  const handlePointerMove = (e) => {
    const start = pointerStartRef.current;
    if (!start) return;
    if (!draggingRef.current) {
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (Math.sqrt(dx * dx + dy * dy) < 6) return; // not yet a drag
      // Begin drag: seed selection with the cell under the pointer
      draggingRef.current = true;
      const initIdx = getIdxAt(start.x, start.y);
      if (initIdx >= 0) {
        setSelected((prev) => (prev.length === 0 ? [initIdx] : prev));
      }
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
    }
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setPointerPos({
        x: ((e.clientX - rect.left) / rect.width) * size,
        y: ((e.clientY - rect.top) / rect.height) * size,
      });
    }
    const idx = getIdxAt(e.clientX, e.clientY);
    if (idx === -1) return;
    setSelected((prev) => {
      if (prev[prev.length - 1] === idx) return prev;
      if (prev.length >= 2 && prev[prev.length - 2] === idx) return prev.slice(0, -1);
      if (prev.includes(idx)) return prev;
      return [...prev, idx];
    });
  };

  const handlePointerUp = () => {
    pointerStartRef.current = null;
    if (draggingRef.current) {
      // it was a drag: submit
      finish();
    }
    // else: was a tap — letter onClick handles it
  };

  // Tap-to-tap: clicking individual letters
  const handleLetterTap = (idx) => {
    if (disabled || draggingRef.current) return;
    setSelected((prev) => {
      if (prev.includes(idx)) {
        // If it's the last, remove it
        if (prev[prev.length - 1] === idx) return prev.slice(0, -1);
        return prev;
      }
      return [...prev, idx];
    });
  };

  const handleSubmitTap = () => {
    if (selected.length >= 2) finish();
    else setSelected([]);
  };

  const currentWord = selected.map((i) => letters[i]).join("");

  // SVG line path between selected letters and pointer
  const linePoints = selected.map((i) => positions[i]);
  const livePath = [...linePoints];
  if (pointerPos && draggingRef.current) livePath.push(pointerPos);
  const pathStr = livePath.length >= 2
    ? "M " + livePath.map((p) => `${p.x},${p.y}`).join(" L ")
    : "";

  return (
    <div className="w-full max-w-sm mx-auto select-none" data-testid="word-circle">
      {/* Active word preview */}
      <div className="text-center mb-3 min-h-[42px]">
        <div
          className="inline-block px-5 py-2 rounded-full bg-white/90 border-2 border-[#E8DFCA] font-black text-2xl tracking-[0.4em] text-[#1E3A8A] min-w-[140px]"
          style={{ fontFamily: "Fredoka, sans-serif" }}
          data-testid="word-preview"
        >
          {currentWord || "—"}
        </div>
      </div>

      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative aspect-square touch-none"
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle at 50% 40%, #FFF6D9 0%, #F5A623 70%, #D92525 100%)",
            boxShadow: "inset 0 -8px 24px rgba(0,0,0,0.25), 0 14px 40px rgba(217,37,37,0.35)",
          }}
        />
        <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 w-full h-full">
          {pathStr && (
            <path
              d={pathStr}
              stroke="#FFFBF0"
              strokeWidth={letterR * 0.55}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity={0.85}
            />
          )}
          {letters.map((ch, i) => {
            const { x, y } = positions[i];
            const isOn = selected.includes(i);
            return (
              <g key={i} onClick={() => handleLetterTap(i)} className="cursor-pointer" data-testid={`circle-letter-${i}`}>
                <circle
                  cx={x}
                  cy={y}
                  r={letterR}
                  fill={isOn ? "#1E3A8A" : "#FFFBF0"}
                  stroke="#2D2323"
                  strokeWidth={3}
                />
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={letterR * 1.0}
                  fontWeight={900}
                  fill={isOn ? "#FFFBF0" : "#2D2323"}
                  style={{ fontFamily: "Fredoka, sans-serif", pointerEvents: "none" }}
                >
                  {ch}
                </text>
              </g>
            );
          })}
        </svg>
        {/* Submit tap area in center */}
        <button
          onClick={handleSubmitTap}
          data-testid="word-submit"
          disabled={selected.length < 2}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white text-[#2D2323] font-black border-4 border-[#2D2323] shadow-md disabled:opacity-50"
          style={{ fontFamily: "Fredoka, sans-serif" }}
        >
          OK
        </button>
      </div>
    </div>
  );
}
