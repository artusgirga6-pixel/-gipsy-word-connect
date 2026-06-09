import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LEVELS } from "@/data/levels";
import { generateGrid, reverseCells, cellsEqual } from "@/lib/gridGenerator";
import WordSearchGrid from "@/components/WordSearchGrid";
import WordList from "@/components/WordList";
import RevealOverlay from "@/components/RevealOverlay";
import CoinsDisplay from "@/components/CoinsDisplay";
import AdModal from "@/components/AdModal";
import CongratsToast from "@/components/CongratsToast";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Hammer, Lightbulb, RotateCcw, Timer, Coins } from "lucide-react";
import { toast } from "sonner";
import { useProgress } from "@/hooks/useProgress";
import { useI18n } from "@/i18n/I18nContext";
import { playSound } from "@/lib/audio";

const AD_COIN_REWARD = 50;
const WORD_REVEAL_COST = 100;

export default function WordSearchGame() {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const idNum = parseInt(levelId, 10);
  const level = LEVELS.find((l) => l.id === idNum);
  const { progress, markComplete, addCoins } = useProgress();

  const [seed, setSeed] = useState(0);
  const board = useMemo(() => (level ? generateGrid(level, seed) : null), [level, seed]);
  const [foundWords, setFoundWords] = useState(new Set());
  const [foundCells, setFoundCells] = useState([]);
  const [hintCells, setHintCells] = useState([]);
  const [revealOpen, setRevealOpen] = useState(false);
  const [congrats, setCongrats] = useState(false);
  const [adOpen, setAdOpen] = useState(false);
  const [adReason, setAdReason] = useState("interstitial");
  const adCallback = React.useRef(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [lastTime, setLastTime] = useState(null);

  useEffect(() => {
    setFoundWords(new Set());
    setFoundCells([]);
    setHintCells([]);
    setRevealOpen(false);
    setCongrats(false);
    setStartTime(Date.now());
    setElapsed(0);
    setLastTime(null);
  }, [idNum, seed]);

  useEffect(() => {
    if (revealOpen || congrats) return;
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(id);
  }, [startTime, revealOpen, congrats]);

  if (!level || !board || level.type !== "word_search") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFBF0]">
        <Button onClick={() => navigate("/")}>{t("game.back") || "Pal"}</Button>
      </div>
    );
  }

  const total = level.words.length;
  const remaining = total - foundWords.size;
  const completionPct = Math.round((foundWords.size / total) * 100);
  const bestTime = progress?.best_times?.[String(level.id)] ?? null;

  const playAd = (reason, onComplete) => {
    setAdReason(reason);
    setAdOpen(true);
    adCallback.current = onComplete;
  };
  const onAdComplete = () => {
    setAdOpen(false);
    const cb = adCallback.current;
    adCallback.current = null;
    if (cb) cb();
  };

  const handleSelect = (cells) => {
    if (foundWords.size === total) return;
    const letters = cells.map((c) => board.grid[c.r][c.c]).join("");
    const reverseLetters = letters.split("").reverse().join("");
    let matched = null;
    for (const p of board.placements) {
      if (foundWords.has(p.word)) continue;
      if (p.word === letters && cellsEqual(cells, p.cells)) { matched = p; break; }
      if (p.word === reverseLetters && cellsEqual(cells, reverseCells(p.cells))) { matched = p; break; }
    }
    if (matched) {
      const next = new Set(foundWords);
      next.add(matched.word);
      setFoundWords(next);
      setFoundCells((prev) => [...prev, ...matched.cells]);
      setHintCells([]);
      playSound("find");
      toast.success(`✓ ${matched.word}`, { duration: 1300 });
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
        // Show congrats toast first, then reveal overlay
        setTimeout(() => setCongrats(true), 400);
      }
    }
  };

  const handleHammer = () => {
    if (foundWords.size === total) return;
    playAd("hint_letter", () => {
      const remainingPlacements = board.placements.filter((p) => !foundWords.has(p.word));
      if (remainingPlacements.length === 0) return;
      const pick = remainingPlacements[Math.floor(Math.random() * remainingPlacements.length)];
      setHintCells(pick.cells.slice(0, 2));
      playSound("click");
      toast(`${pick.word[0]} …`, { duration: 1500 });
    });
  };

  const handleLightbulb = () => {
    playAd("ad_reward", () => {
      addCoins(AD_COIN_REWARD, "ad_reward").catch(() => {});
      toast.success(t("game.coinReward", { n: AD_COIN_REWARD }), { duration: 1300 });
    });
  };

  const handleBuyWord = () => {
    if (foundWords.size === total) return;
    if ((progress?.coins ?? 0) < WORD_REVEAL_COST) {
      toast.error(t("game.needCoins", { n: WORD_REVEAL_COST }), { duration: 1500 });
      return;
    }
    const remainingPlacements = board.placements.filter((p) => !foundWords.has(p.word));
    if (remainingPlacements.length === 0) return;
    const pick = remainingPlacements[Math.floor(Math.random() * remainingPlacements.length)];
    addCoins(-WORD_REVEAL_COST, "word_reveal").catch(() => {});
    const next = new Set(foundWords);
    next.add(pick.word);
    setFoundWords(next);
    setFoundCells((prev) => [...prev, ...pick.cells]);
    playSound("find");
    toast.success(`★ ${pick.word}`, { duration: 1400 });
    if (next.size === total) {
      const completedIn = Math.floor((Date.now() - startTime) / 1000);
      setLastTime(completedIn);
      playSound("complete");
      markComplete({
        level: level.id,
        phrase: level.phrase,
        translation: level.translation,
        theme: level.title,
        timeSeconds: completedIn,
      }).catch(() => {});
      setTimeout(() => setCongrats(true), 400);
    }
  };

  const handleReshuffle = () => {
    setSeed((s) => s + 1);
    playSound("click");
  };

  const continueAfterCongrats = () => {
    setCongrats(false);
    if (level.isBonus || level.isFinal) {
      // Bonus level: open reveal overlay with leftover-letter funny word
      setTimeout(() => setRevealOpen(true), 150);
    } else {
      // Normal level: skip reveal, go straight to ad → next
      playAd("interstitial", () => {
        if (level.id < 50) navigate(`/level/${level.id + 1}`);
        else navigate("/");
      });
    }
  };

  const continueAfterReveal = () => {
    setRevealOpen(false);
    playAd("interstitial", () => {
      if (level.id < 50) navigate(`/level/${level.id + 1}`);
      else navigate("/");
    });
  };

  return (
    <div className="min-h-screen bg-[#FFFBF0] relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1740083652679-439b3dd548d3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwxfHxjb2xvcmZ1bCUyMGZsb3JhbCUyMGZvbGslMjBmcmFtZXxlbnwwfHx8fDE3ODA2NjgxMDV8MA&ixlib=rb-4.1.0&q=85)",
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
            <ArrowLeft className="w-4 h-4 mr-1" /> Pal
          </Button>
          <div className="text-center flex-1 min-w-0">
            <div className="text-[#D92525] uppercase tracking-[0.18em] text-[10px] sm:text-xs font-bold">
              Rango {level.id} / 50 · {level.gridSize}×{level.gridSize}{level.isBonus ? " · BONUS" : ""}
            </div>
            <h1
              className="text-xl sm:text-3xl font-bold text-[#2D2323] truncate"
              style={{ fontFamily: "Fredoka, sans-serif" }}
              data-testid="level-title"
            >
              {level.title}
            </h1>
          </div>
          <CoinsDisplay coins={progress?.coins ?? 0} />
        </header>

        <div className="mb-4 p-3 rounded-2xl bg-white/80 border-2 border-[#E8DFCA] backdrop-blur">
          <div className="flex items-center justify-between mb-1.5 text-sm">
            <span className="font-semibold text-[#1E3A8A]">
              {foundWords.size}/{total} lava
            </span>
            <div className="flex items-center gap-3">
              <span className="text-[#5C4B4B]" data-testid="remaining-count">Achile: {remaining}</span>
              <span className="inline-flex items-center gap-1 text-[#2D2323] font-mono font-semibold tabular-nums" data-testid="timer">
                <Timer className="w-3.5 h-3.5 text-[#D92525]" /> {elapsed}s
              </span>
              {bestTime != null && (
                <span className="text-[#2B8C44] text-xs font-semibold" data-testid="best-time">★ {bestTime}s</span>
              )}
            </div>
          </div>
          <Progress value={completionPct} className="h-2.5 bg-[#E8DFCA]" />
        </div>

        <div className="mb-4 flex justify-center gap-2">
          <Button
            data-testid="hint-hammer"
            onClick={handleHammer}
            disabled={foundWords.size === total}
            className="bg-[#D92525] hover:bg-[#B81E1E] text-white font-bold rounded-full"
          >
            <Hammer className="w-4 h-4 mr-1" /> Čukanos
          </Button>
          <Button
            data-testid="hint-lightbulb"
            onClick={handleLightbulb}
            className="bg-[#F5A623] hover:bg-[#E09611] text-[#3a2200] font-bold rounded-full"
          >
            <Lightbulb className="w-4 h-4 mr-1" /> +{AD_COIN_REWARD} ☼
          </Button>
          <Button
            data-testid="buy-word"
            onClick={handleBuyWord}
            disabled={(progress?.coins ?? 0) < WORD_REVEAL_COST || foundWords.size === total}
            className="bg-[#1E3A8A] hover:bg-[#152965] text-white font-bold rounded-full disabled:opacity-50"
          >
            <Coins className="w-4 h-4 mr-1" /> −{WORD_REVEAL_COST}
          </Button>
          <Button
            data-testid="reset-game-button"
            variant="outline"
            onClick={handleReshuffle}
            className="border-2 border-[#E8DFCA] rounded-full bg-white/70"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        <div className="mb-6">
          <WordSearchGrid
            grid={board.grid}
            foundCells={foundCells}
            highlightedCells={hintCells}
            onSelect={handleSelect}
            disabled={revealOpen || congrats}
          />
        </div>

        <WordList words={level.words} foundWords={foundWords} />
      </div>

      <CongratsToast open={congrats} level={level.id} onDone={continueAfterCongrats} />
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
        onContinue={continueAfterReveal}
        onHome={() => navigate("/")}
        nextLabel={level.id === 50 ? "Gata" : "Aver rango"}
      />
      <AdModal open={adOpen} reason={adReason} onComplete={onAdComplete} />
    </div>
  );
}
