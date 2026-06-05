import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LEVELS } from "@/data/levels";
import { generateGrid, reverseCells, cellsEqual } from "@/lib/gridGenerator";
import WordSearchGrid from "@/components/WordSearchGrid";
import WordList from "@/components/WordList";
import RevealOverlay from "@/components/RevealOverlay";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Lightbulb, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useProgress } from "@/hooks/useProgress";

export default function Game() {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const idNum = parseInt(levelId, 10);
  const level = LEVELS.find((l) => l.id === idNum);
  const { markComplete } = useProgress();

  const [seed, setSeed] = useState(0);
  const board = useMemo(() => (level ? generateGrid(level, seed) : null), [level, seed]);
  const [foundWords, setFoundWords] = useState(new Set());
  const [foundCells, setFoundCells] = useState([]);
  const [hintCells, setHintCells] = useState([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [revealOpen, setRevealOpen] = useState(false);
  const [startTime] = useState(Date.now());

  // Reset state when level changes
  useEffect(() => {
    setFoundWords(new Set());
    setFoundCells([]);
    setHintCells([]);
    setHintsUsed(0);
    setRevealOpen(false);
  }, [idNum, seed]);

  if (!level || !board) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFBF0]">
        <div className="text-center">
          <p className="text-[#5C4B4B] mb-4">Úroveň nenalezena.</p>
          <Button onClick={() => navigate("/")}>Zpět</Button>
        </div>
      </div>
    );
  }

  const total = level.words.length;
  const remaining = total - foundWords.size;
  const completionPct = Math.round((foundWords.size / total) * 100);

  const handleSelect = (cells) => {
    if (foundWords.size === total) return;
    const letters = cells.map((c) => board.grid[c.r][c.c]).join("");
    const reverseLetters = letters.split("").reverse().join("");
    let matched = null;
    for (const p of board.placements) {
      if (foundWords.has(p.word)) continue;
      if (p.word === letters && cellsEqual(cells, p.cells)) {
        matched = p;
        break;
      }
      if (p.word === reverseLetters && cellsEqual(cells, reverseCells(p.cells))) {
        matched = p;
        break;
      }
      // direction-agnostic check using stored cells
      if (p.word === letters && cellsEqual(p.cells, cells)) {
        matched = p;
        break;
      }
      if (p.word === reverseLetters && cellsEqual(reverseCells(p.cells), cells)) {
        matched = p;
        break;
      }
    }
    if (matched) {
      const next = new Set(foundWords);
      next.add(matched.word);
      setFoundWords(next);
      setFoundCells((prev) => [...prev, ...matched.cells]);
      setHintCells([]);
      toast.success(`Skvěle! Našel jsi "${matched.word}"`, { duration: 1500 });
      if (next.size === total) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        // mark complete in background
        markComplete({
          level: level.id,
          phrase: level.phrase,
          translation: level.translation,
          theme: level.title,
          timeSeconds: elapsed,
        }).catch(() => {});
        setTimeout(() => setRevealOpen(true), 600);
      }
    }
  };

  const handleHint = () => {
    const remainingWords = board.placements.filter((p) => !foundWords.has(p.word));
    if (remainingWords.length === 0) return;
    const pick = remainingWords[Math.floor(Math.random() * remainingWords.length)];
    // show first 2 cells
    setHintCells(pick.cells.slice(0, 2));
    setHintsUsed((n) => n + 1);
    toast(`Nápověda: slovo "${pick.word}" začíná zde`, { duration: 2200 });
  };

  const handleReshuffle = () => {
    setSeed((s) => s + 1);
    toast("Nová mřížka vygenerována", { duration: 1200 });
  };

  const continueNext = () => {
    if (level.id < LEVELS.length) {
      navigate(`/level/${level.id + 1}`);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBF0] relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1740083652679-439b3dd548d3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwxfHxjb2xvcmZ1bCUyMGZsb3JhbCUyMGZvbGslMjBwYXR0ZXJufGVufDB8fHx8MTc4MDY2ODEwNXww&ixlib=rb-4.1.0&q=85)",
          backgroundSize: "240px",
          backgroundRepeat: "repeat",
        }}
      />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <header className="flex items-center justify-between gap-2 mb-4">
          <Button
            data-testid="back-button"
            variant="outline"
            onClick={() => navigate("/")}
            className="border-2 border-[#E8DFCA] rounded-xl bg-white/70 hover:bg-white"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Úrovně
          </Button>
          <div className="text-center flex-1">
            <div className="text-[#D92525] uppercase tracking-[0.18em] text-[10px] sm:text-xs font-bold">
              Úroveň {level.id} / {LEVELS.length} · {level.gridSize}×{level.gridSize}
            </div>
            <h1
              className="text-xl sm:text-3xl font-bold text-[#2D2323]"
              style={{ fontFamily: "Fredoka, sans-serif" }}
              data-testid="level-title"
            >
              {level.title}
            </h1>
          </div>
          <div className="flex gap-2">
            <Button
              data-testid="hint-button"
              variant="outline"
              onClick={handleHint}
              className="border-2 border-[#F5A623] text-[#A36A00] rounded-xl bg-white/70 hover:bg-[#FFFBF0]"
            >
              <Lightbulb className="w-4 h-4 mr-1" /> Nápověda
              {hintsUsed > 0 && <span className="ml-1 text-xs opacity-70">({hintsUsed})</span>}
            </Button>
            <Button
              data-testid="reset-game-button"
              variant="outline"
              onClick={handleReshuffle}
              className="border-2 border-[#E8DFCA] rounded-xl bg-white/70 hover:bg-white"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Progress */}
        <div className="mb-4 p-3 rounded-2xl bg-white/80 border-2 border-[#E8DFCA] backdrop-blur">
          <div className="flex items-center justify-between mb-1.5 text-sm">
            <span className="font-semibold text-[#1E3A8A]">
              {foundWords.size} / {total} slov nalezeno
            </span>
            <span className="text-[#5C4B4B]" data-testid="remaining-count">
              Zbývá: {remaining}
            </span>
          </div>
          <Progress value={completionPct} className="h-2.5 bg-[#E8DFCA]" />
        </div>

        {/* Grid */}
        <div className="mb-6">
          <WordSearchGrid
            grid={board.grid}
            foundCells={foundCells}
            highlightedCells={hintCells}
            onSelect={handleSelect}
            disabled={revealOpen}
          />
        </div>

        {/* Word list */}
        <WordList words={level.words} foundWords={foundWords} />
      </div>

      <RevealOverlay
        open={revealOpen}
        phrase={level.phrase}
        translation={level.translation}
        theme={level.title}
        isFinal={level.isFinal}
        onContinue={continueNext}
        onHome={() => navigate("/")}
        nextLabel={level.id === LEVELS.length ? "Hotovo" : "Další úroveň"}
      />
    </div>
  );
}
