import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LEVELS } from "@/data/levels";
import { generateGrid, reverseCells, cellsEqual } from "@/lib/gridGenerator";
import WordSearchGrid from "@/components/WordSearchGrid";
import WordList from "@/components/WordList";
import RevealOverlay from "@/components/RevealOverlay";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Lightbulb, RotateCcw, Timer } from "lucide-react";
import { toast } from "sonner";
import { useProgress } from "@/hooks/useProgress";
import { useI18n } from "@/i18n/I18nContext";
import { playSound } from "@/lib/audio";

export default function Game() {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const idNum = parseInt(levelId, 10);
  const level = LEVELS.find((l) => l.id === idNum);
  const { progress, markComplete } = useProgress();

  const [seed, setSeed] = useState(0);
  const board = useMemo(() => (level ? generateGrid(level, seed) : null), [level, seed]);
  const [foundWords, setFoundWords] = useState(new Set());
  const [foundCells, setFoundCells] = useState([]);
  const [hintCells, setHintCells] = useState([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [revealOpen, setRevealOpen] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [lastTime, setLastTime] = useState(null);

  useEffect(() => {
    setFoundWords(new Set());
    setFoundCells([]);
    setHintCells([]);
    setHintsUsed(0);
    setRevealOpen(false);
    setStartTime(Date.now());
    setElapsed(0);
    setLastTime(null);
  }, [idNum, seed]);

  // tick timer
  useEffect(() => {
    if (revealOpen) return;
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(id);
  }, [startTime, revealOpen]);

  if (!level || !board) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFBF0]">
        <div className="text-center">
          <p className="text-[#5C4B4B] mb-4">{t("game.notFound")}</p>
          <Button onClick={() => navigate("/")}>{t("game.back")}</Button>
        </div>
      </div>
    );
  }

  const total = level.words.length;
  const remaining = total - foundWords.size;
  const completionPct = Math.round((foundWords.size / total) * 100);
  const bestTime = progress?.best_times?.[String(level.id)] ?? null;

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
    }
    if (matched) {
      const next = new Set(foundWords);
      next.add(matched.word);
      setFoundWords(next);
      setFoundCells((prev) => [...prev, ...matched.cells]);
      setHintCells([]);
      playSound("find");
      toast.success(t("game.found", { word: matched.word }), { duration: 1500 });
      if (next.size === total) {
        const completedIn = Math.floor((Date.now() - startTime) / 1000);
        setLastTime(completedIn);
        playSound(level.isMilestone ? "milestone" : "complete");
        markComplete({
          level: level.id,
          phrase: level.phrase,
          translation: level.translation,
          theme: level.title,
          timeSeconds: completedIn,
        }).catch(() => {});
        setTimeout(() => {
          playSound("reveal");
          setRevealOpen(true);
        }, 600);
      }
    }
  };

  const handleHint = () => {
    const remainingWords = board.placements.filter((p) => !foundWords.has(p.word));
    if (remainingWords.length === 0) return;
    const pick = remainingWords[Math.floor(Math.random() * remainingWords.length)];
    setHintCells(pick.cells.slice(0, 2));
    setHintsUsed((n) => n + 1);
    playSound("click");
    toast(t("game.hint", { word: pick.word }), { duration: 2200 });
  };

  const handleReshuffle = () => {
    setSeed((s) => s + 1);
    playSound("click");
    toast(t("game.reshuffled"), { duration: 1200 });
  };

  const continueNext = () => {
    if (level.id < LEVELS.length) navigate(`/level/${level.id + 1}`);
    else navigate("/");
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
        <header className="flex items-center justify-between gap-2 mb-4">
          <Button
            data-testid="back-button"
            variant="outline"
            onClick={() => navigate("/")}
            className="border-2 border-[#E8DFCA] rounded-xl bg-white/70 hover:bg-white"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> {t("btn.levels")}
          </Button>
          <div className="text-center flex-1 min-w-0">
            <div className="text-[#D92525] uppercase tracking-[0.18em] text-[10px] sm:text-xs font-bold">
              {t("game.level", { id: level.id, total: LEVELS.length })} · {level.gridSize}×{level.gridSize}
            </div>
            <h1
              className="text-xl sm:text-3xl font-bold text-[#2D2323] truncate"
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
              <Lightbulb className="w-4 h-4 mr-1" /> {t("btn.hint")}
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

        <div className="mb-4 p-3 rounded-2xl bg-white/80 border-2 border-[#E8DFCA] backdrop-blur">
          <div className="flex items-center justify-between mb-1.5 text-sm">
            <span className="font-semibold text-[#1E3A8A]">
              {t("game.foundCount", { done: foundWords.size, total })}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-[#5C4B4B]" data-testid="remaining-count">
                {t("game.remaining", { n: remaining })}
              </span>
              <span className="inline-flex items-center gap-1 text-[#2D2323] font-mono font-semibold tabular-nums" data-testid="timer">
                <Timer className="w-3.5 h-3.5 text-[#D92525]" /> {elapsed}s
              </span>
              {bestTime != null && (
                <span className="text-[#2B8C44] text-xs font-semibold" data-testid="best-time">
                  ★ {bestTime}s
                </span>
              )}
            </div>
          </div>
          <Progress value={completionPct} className="h-2.5 bg-[#E8DFCA]" />
        </div>

        <div className="mb-6">
          <WordSearchGrid
            grid={board.grid}
            foundCells={foundCells}
            highlightedCells={hintCells}
            onSelect={handleSelect}
            disabled={revealOpen}
          />
        </div>

        <WordList words={level.words} foundWords={foundWords} />
      </div>

      <RevealOverlay
        open={revealOpen}
        phrase={level.phrase}
        translation={level.translation}
        theme={level.title}
        isFinal={level.isFinal}
        isMilestone={level.isMilestone}
        levelId={level.id}
        timeSeconds={lastTime}
        bestSeconds={bestTime}
        onContinue={continueNext}
        onHome={() => navigate("/")}
        nextLabel={level.id === LEVELS.length ? t("btn.done") : t("btn.next")}
      />
    </div>
  );
}
