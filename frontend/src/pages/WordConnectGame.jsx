import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LEVELS } from "@/data/levels";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Hammer, Lightbulb, Coins } from "lucide-react";
import { toast } from "sonner";
import WordCircle from "@/components/WordCircle";
import CrosswordBoard from "@/components/CrosswordBoard";
import CoinsDisplay from "@/components/CoinsDisplay";
import AdModal from "@/components/AdModal";
import CongratsToast from "@/components/CongratsToast";
import { useProgress } from "@/hooks/useProgress";
import { useI18n } from "@/i18n/I18nContext";
import { playSound } from "@/lib/audio";
import { placeCrossword } from "@/lib/crosswordPlacer";

const WORD_REVEAL_COST = 100;
const AD_COIN_REWARD = 50;

function shuffle(arr, seed) {
  const a = [...arr];
  let s = seed || 1;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function WordConnectGame() {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const idNum = parseInt(levelId, 10);
  const level = LEVELS.find((l) => l.id === idNum);
  const { progress, markComplete, addCoins } = useProgress();

  // Pre-mix letters once per level
  const shuffledLetters = useMemo(() => {
    if (!level) return [];
    return shuffle(level.letters.split(""), level.id);
  }, [level]);

  // Place words inside the shape mask
  const board = useMemo(() => (level ? placeCrossword(level) : null), [level]);

  const [found, setFound] = useState(new Set());
  const [revealedLetters, setRevealedLetters] = useState(new Map()); // word → Set<index>
  const [congrats, setCongrats] = useState(false);
  const [adOpen, setAdOpen] = useState(false);
  const [adReason, setAdReason] = useState("interstitial");
  const adCallback = React.useRef(null);

  useEffect(() => {
    setFound(new Set());
    setRevealedLetters(new Map());
    setCongrats(false);
  }, [idNum]);

  if (!level || level.type !== "word_connect") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFBF0]">
        <Button onClick={() => navigate("/")}>{t("game.back") || "Pal"}</Button>
      </div>
    );
  }

  const total = level.words.length;
  const completionPct = Math.round((found.size / total) * 100);
  const isComplete = found.size === total;

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

  const submitWord = (word) => {
    const upper = word.toUpperCase();
    const match = level.words.find((w) => w === upper && !found.has(w));
    if (match) {
      const next = new Set(found);
      next.add(match);
      setFound(next);
      playSound("find");
      toast.success(`✓ ${match}`, { duration: 1200 });
      if (next.size === total) {
        playSound(level.isMilestone ? "milestone" : "complete");
        // Mark complete + congrats + interstitial ad → return
        markComplete({
          level: level.id,
          phrase: level.theme,
          translation: "",
          theme: level.theme,
          timeSeconds: 0,
        }).catch(() => {});
        setTimeout(() => setCongrats(true), 200);
      }
    } else if (level.words.includes(upper)) {
      toast(`${upper} – už nalezeno`, { duration: 900 });
    } else {
      toast.error("✗ Nie", { duration: 700 });
    }
  };

  const handleHammer = () => {
    if (isComplete) return;
    // Find a word with hidden letters
    const incomplete = level.words.find((w) => !found.has(w));
    if (!incomplete) return;
    playAd("hint_letter", () => {
      // Reveal first hidden letter (index 0 of an incomplete word)
      const reveals = revealedLetters.get(incomplete) || new Set();
      const nextIdx = [...incomplete].findIndex((_, i) => !reveals.has(i));
      if (nextIdx >= 0) {
        const newSet = new Set(reveals);
        newSet.add(nextIdx);
        const m = new Map(revealedLetters);
        m.set(incomplete, newSet);
        setRevealedLetters(m);
        playSound("click");
        toast(`${incomplete}: ${incomplete[nextIdx]}`, { duration: 1500 });
      }
    });
  };

  const handleLightbulb = () => {
    playAd("ad_reward", () => {
      addCoins(AD_COIN_REWARD, "ad_reward").catch(() => {});
      playSound("complete");
      toast.success(`+${AD_COIN_REWARD} ☼`, { duration: 1300 });
    });
  };

  const handleBuyWord = () => {
    if ((progress?.coins ?? 0) < WORD_REVEAL_COST) {
      toast.error(`Trubol ${WORD_REVEAL_COST} ☼`, { duration: 1500 });
      return;
    }
    const incomplete = level.words.find((w) => !found.has(w));
    if (!incomplete) return;
    addCoins(-WORD_REVEAL_COST, "word_reveal").catch(() => {});
    const next = new Set(found);
    next.add(incomplete);
    setFound(next);
    playSound("find");
    toast.success(`★ ${incomplete}`, { duration: 1400 });
    if (next.size === total) {
      playSound("complete");
      markComplete({
        level: level.id,
        phrase: level.theme,
        theme: level.theme,
      }).catch(() => {});
      setTimeout(() => setCongrats(true), 200);
    }
  };

  const continueAfterCongrats = () => {
    setCongrats(false);
    // Interstitial ad after every level
    playAd("interstitial", () => {
      if (level.id < 100) navigate(`/level/${level.id + 1}`);
      else navigate("/");
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFBF0] via-[#FFF6D9] to-[#FFE4B8] relative">
      <div className="relative max-w-4xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
        {/* Header */}
        <header className="flex items-center justify-between gap-2 mb-2">
          <Button
            data-testid="back-button"
            variant="outline"
            onClick={() => navigate("/")}
            className="border-2 border-[#E8DFCA] rounded-xl bg-white/80"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Pal
          </Button>
          <div className="text-center flex-1">
            <div className="text-[#D92525] uppercase tracking-[0.2em] text-[10px] sm:text-xs font-black">
              Rango {level.id} / 100
            </div>
            <h1
              className="text-xl sm:text-2xl font-black text-[#2D2323]"
              style={{ fontFamily: "Fredoka, sans-serif" }}
              data-testid="level-title"
            >
              {level.theme}
            </h1>
          </div>
          <CoinsDisplay coins={progress?.coins ?? 0} />
        </header>

        {/* Progress */}
        <div className="mb-3">
          <Progress value={completionPct} className="h-2 bg-[#E8DFCA]" />
          <div className="flex justify-between text-xs mt-1 text-[#5C4B4B]">
            <span>{found.size}/{total}</span>
            <span>{completionPct}%</span>
          </div>
        </div>

        {/* Crossword */}
        <div className="mb-3">
          <CrosswordBoard
            board={board}
            found={found}
            revealedLetters={revealedLetters}
            shape={level.shape}
          />
        </div>

        {/* Hint bar */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <Button
            data-testid="hint-hammer"
            onClick={handleHammer}
            disabled={isComplete}
            className="bg-[#D92525] hover:bg-[#B81E1E] text-white font-bold rounded-full shadow-[0_4px_0_0_#A31A1A] active:translate-y-1 active:shadow-none"
            title="Hammer: ad → 1 letter"
          >
            <Hammer className="w-4 h-4 mr-1" />
            Cokano
          </Button>
          <Button
            data-testid="hint-lightbulb"
            onClick={handleLightbulb}
            className="bg-[#F5A623] hover:bg-[#E09611] text-[#3a2200] font-bold rounded-full shadow-[0_4px_0_0_#A36A00] active:translate-y-1 active:shadow-none"
            title="Watch ad: +50 coins"
          >
            <Lightbulb className="w-4 h-4 mr-1" />
            +{AD_COIN_REWARD} ☼
          </Button>
          <Button
            data-testid="buy-word"
            onClick={handleBuyWord}
            disabled={isComplete || (progress?.coins ?? 0) < WORD_REVEAL_COST}
            className="bg-[#1E3A8A] hover:bg-[#152965] text-white font-bold rounded-full shadow-[0_4px_0_0_#152965] active:translate-y-1 active:shadow-none disabled:opacity-50"
            title="Buy whole word for 100 coins"
          >
            <Coins className="w-4 h-4 mr-1" />
            −{WORD_REVEAL_COST}
          </Button>
        </div>

        {/* Word Circle */}
        <WordCircle
          letters={shuffledLetters}
          onSubmit={submitWord}
          disabled={isComplete}
        />
      </div>

      <CongratsToast open={congrats} level={level.id} onDone={continueAfterCongrats} />
      <AdModal open={adOpen} reason={adReason} onComplete={onAdComplete} />
    </div>
  );
}
