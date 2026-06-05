import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LEVELS } from "@/data/levels";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Hammer, Lightbulb, Shuffle } from "lucide-react";
import { toast } from "sonner";
import CoinsDisplay from "@/components/CoinsDisplay";
import AdModal from "@/components/AdModal";
import CongratsToast from "@/components/CongratsToast";
import { useProgress } from "@/hooks/useProgress";
import { playSound } from "@/lib/audio";

const AD_COIN_REWARD = 50;

export default function AnagramGame() {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const idNum = parseInt(levelId, 10);
  const level = LEVELS.find((l) => l.id === idNum);
  const { progress, markComplete, addCoins } = useProgress();

  const [selected, setSelected] = useState([]); // indices of scramble letters used
  const [letters, setLetters] = useState([]);   // initial scramble letters
  const [revealed, setRevealed] = useState(new Set()); // hint reveals (indices of answer)
  const [congrats, setCongrats] = useState(false);
  const [adOpen, setAdOpen] = useState(false);
  const [adReason, setAdReason] = useState("interstitial");
  const adCallback = React.useRef(null);

  useEffect(() => {
    if (!level) return;
    setSelected([]);
    setRevealed(new Set());
    setCongrats(false);
    setLetters(level.scramble.split(""));
  }, [idNum, level]);

  const currentGuess = useMemo(
    () => selected.map((i) => letters[i] || "").join(""),
    [selected, letters]
  );

  if (!level || level.type !== "anagram") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFBF0]">
        <Button onClick={() => navigate("/")}>Pal</Button>
      </div>
    );
  }

  const answer = level.answer;

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

  const handleLetterTap = (idx) => {
    if (selected.includes(idx)) {
      // remove this and everything after
      const pos = selected.indexOf(idx);
      setSelected(selected.slice(0, pos));
      return;
    }
    const newSel = [...selected, idx];
    setSelected(newSel);
    if (newSel.length === answer.length) {
      const guess = newSel.map((i) => letters[i]).join("");
      if (guess === answer) {
        playSound(level.isMilestone ? "milestone" : "complete");
        markComplete({
          level: level.id,
          phrase: answer,
          translation: level.translation,
          theme: level.theme,
        }).catch(() => {});
        setTimeout(() => setCongrats(true), 250);
      } else {
        playSound("click");
        toast.error("Nie", { duration: 800 });
        setTimeout(() => setSelected([]), 600);
      }
    }
  };

  const handleShuffle = () => {
    setLetters((arr) => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    });
    setSelected([]);
    playSound("click");
  };

  const handleHammer = () => {
    playAd("hint_letter", () => {
      // Reveal next letter in answer
      const nextIdx = [...answer].findIndex((_, i) => !revealed.has(i));
      if (nextIdx === -1) return;
      const r = new Set(revealed);
      r.add(nextIdx);
      setRevealed(r);
      toast(`${answer[nextIdx]}`, { duration: 1200 });
      playSound("click");
    });
  };

  const handleLightbulb = () => {
    playAd("ad_reward", () => {
      addCoins(AD_COIN_REWARD, "ad_reward").catch(() => {});
      toast.success(`+${AD_COIN_REWARD} ☼`, { duration: 1300 });
    });
  };

  const continueAfterCongrats = () => {
    setCongrats(false);
    playAd("interstitial", () => {
      if (level.id < 100) navigate(`/level/${level.id + 1}`);
      else navigate("/");
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EFF6FF] via-[#FFFBF0] to-[#FAE8FF] relative">
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <header className="flex items-center justify-between gap-2 mb-4">
          <Button
            data-testid="back-button"
            variant="outline"
            onClick={() => navigate("/")}
            className="border-2 border-[#E8DFCA] rounded-xl bg-white/80"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Pal
          </Button>
          <div className="text-center flex-1">
            <div className="text-[#7E22CE] uppercase tracking-[0.2em] text-[10px] sm:text-xs font-black">
              Anagrama · Rango {level.id}
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

        {/* Answer slots */}
        <div className="flex justify-center gap-2 mb-8 mt-6" data-testid="anagram-slots">
          {answer.split("").map((ch, i) => {
            const usedLetter = selected[i] != null ? letters[selected[i]] : null;
            const isRevealed = revealed.has(i);
            const display = usedLetter || (isRevealed ? ch : "");
            return (
              <div
                key={i}
                className={[
                  "w-11 h-11 sm:w-14 sm:h-14 flex items-center justify-center rounded-xl border-2 font-black text-xl sm:text-3xl",
                  display ? "bg-[#1E3A8A] text-white border-[#152965]" : "bg-white/80 border-[#E8DFCA] text-[#5C4B4B]",
                ].join(" ")}
                style={{ fontFamily: "Fredoka, sans-serif" }}
                data-testid={`anagram-slot-${i}`}
              >
                {display || ""}
              </div>
            );
          })}
        </div>

        {/* Scrambled letters */}
        <div className="flex flex-wrap justify-center gap-2 mb-6" data-testid="anagram-tiles">
          {letters.map((ch, i) => {
            const isUsed = selected.includes(i);
            return (
              <button
                key={i}
                onClick={() => handleLetterTap(i)}
                disabled={isUsed}
                data-testid={`anagram-tile-${i}`}
                className={[
                  "w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2 font-black text-xl sm:text-2xl transition-all",
                  isUsed
                    ? "bg-[#E8DFCA] text-[#8A7C68] border-[#D1C7B1]"
                    : "bg-gradient-to-br from-[#FFCB45] to-[#F5A623] text-[#2D2323] border-[#A36A00] hover:scale-110 active:scale-95 shadow-[0_3px_0_0_#A36A00]",
                ].join(" ")}
                style={{ fontFamily: "Fredoka, sans-serif" }}
              >
                {ch}
              </button>
            );
          })}
        </div>

        <div className="flex justify-center gap-3">
          <Button
            data-testid="hint-hammer"
            onClick={handleHammer}
            className="bg-[#D92525] hover:bg-[#B81E1E] text-white font-bold rounded-full"
          >
            <Hammer className="w-4 h-4 mr-1" /> Cokano
          </Button>
          <Button
            data-testid="anagram-shuffle"
            onClick={handleShuffle}
            variant="outline"
            className="border-2 border-[#E8DFCA] rounded-full"
          >
            <Shuffle className="w-4 h-4" />
          </Button>
          <Button
            data-testid="hint-lightbulb"
            onClick={handleLightbulb}
            className="bg-[#F5A623] hover:bg-[#E09611] text-[#3a2200] font-bold rounded-full"
          >
            <Lightbulb className="w-4 h-4 mr-1" /> +{AD_COIN_REWARD} ☼
          </Button>
        </div>

        <div className="text-center text-sm text-[#5C4B4B] mt-6 italic">{level.translation}</div>
      </div>

      <CongratsToast open={congrats} level={level.id} onDone={continueAfterCongrats} />
      <AdModal open={adOpen} reason={adReason} onComplete={onAdComplete} />
    </div>
  );
}
