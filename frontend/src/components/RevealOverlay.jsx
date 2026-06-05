import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Home, Share2, Crown, Star } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/i18n/I18nContext";
import { shareOrCopy } from "@/lib/share";

export default function RevealOverlay({
  open,
  phrase,
  translation,
  theme,
  isFinal,
  isMilestone,
  levelId,
  timeSeconds,
  bestSeconds,
  onContinue,
  onHome,
  nextLabel,
}) {
  const { t } = useI18n();

  useEffect(() => {
    if (!open) return;
    const fire = (particleRatio, opts) => {
      confetti({
        ...opts,
        origin: { y: 0.6 },
        particleCount: Math.floor(220 * particleRatio),
        colors: ["#D92525", "#F5A623", "#1E3A8A", "#2B8C44", "#FFFBF0"],
      });
    };
    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
    if (isFinal || isMilestone) {
      const t1 = setTimeout(() => fire(0.5, { spread: 90, startVelocity: 65 }), 600);
      const t2 = setTimeout(() => fire(0.5, { spread: 120, startVelocity: 70 }), 1200);
      const t3 = isFinal
        ? setTimeout(() => fire(0.6, { spread: 160, startVelocity: 80 }), 1800)
        : null;
      return () => { clearTimeout(t1); clearTimeout(t2); if (t3) clearTimeout(t3); };
    }
  }, [open, isFinal, isMilestone]);

  const handleShare = async () => {
    const text = t("reveal.shareText", { id: levelId, phrase, translation: translation || "" });
    const status = await shareOrCopy({
      title: t("reveal.shareTitle"),
      text,
    });
    if (status === "copied") {
      toast.success(t("reveal.copied"));
    }
  };

  const festive = isFinal || isMilestone;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(45,35,35,0.55)] backdrop-blur-md p-4"
          data-testid="reveal-overlay"
        >
          <motion.div
            initial={{ scale: 0.85, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", damping: 18, stiffness: 220 }}
            className={[
              "relative max-w-3xl w-full backdrop-blur-xl rounded-3xl p-6 sm:p-10",
              festive
                ? "bg-gradient-to-br from-white/90 via-[#FFFBF0] to-[#F5E0B0]/80 border-4 border-[#F5A623] shadow-[0_20px_0_0_#D8951C]"
                : "bg-white/90 border-2 border-[#E8DFCA] shadow-[0_20px_0_0_rgba(232,223,202,0.6)]",
            ].join(" ")}
          >
            {/* Festive stars */}
            {festive && (
              <>
                <Star className="absolute -top-4 -left-4 w-9 h-9 text-[#F5A623] fill-[#F5A623] animate-pulse" />
                <Star className="absolute -top-4 -right-4 w-7 h-7 text-[#D92525] fill-[#D92525] animate-pulse" style={{ animationDelay: "150ms" }} />
                <Sparkles className="absolute -bottom-4 -right-2 w-10 h-10 text-[#1E3A8A]" />
              </>
            )}

            <div className="flex items-center gap-2 text-[#D92525] uppercase tracking-[0.15em] text-xs sm:text-sm font-bold mb-2">
              {isFinal ? <Crown className="w-4 h-4 text-[#F5A623]" /> : <Sparkles className="w-4 h-4" />}
              {isFinal ? t("reveal.final") : t("reveal.title")}
            </div>
            <h2
              className="text-2xl sm:text-3xl font-bold text-[#1E3A8A] mb-1"
              style={{ fontFamily: "Fredoka, sans-serif" }}
            >
              {theme}
            </h2>
            {timeSeconds != null && (
              <div className="text-sm text-[#5C4B4B]" data-testid="reveal-time">
                {t("reveal.completed", { sec: timeSeconds, best: bestSeconds != null ? `${bestSeconds}s` : "—" })}
              </div>
            )}
            <motion.div
              key={phrase}
              initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
              animate={{ scale: 1, opacity: 1, rotate: -2 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 180 }}
              className="my-6 text-center"
              data-testid="reveal-phrase"
            >
              <div
                className="text-3xl sm:text-5xl font-black text-[#F5A623] drop-shadow-md"
                style={{ fontFamily: "Fredoka, sans-serif", letterSpacing: "0.02em" }}
              >
                {phrase}
              </div>
              {translation && (
                <div
                  className="mt-3 text-base sm:text-lg text-[#5C4B4B] italic"
                  data-testid="reveal-translation"
                >
                  „{translation}"
                </div>
              )}
            </motion.div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                data-testid="reveal-share-button"
                variant="outline"
                onClick={handleShare}
                className="border-2 border-[#1E3A8A] text-[#1E3A8A] hover:bg-[#1E3A8A] hover:text-white rounded-xl"
              >
                <Share2 className="w-4 h-4 mr-2" /> {t("btn.share")}
              </Button>
              <Button
                data-testid="reveal-home-button"
                variant="outline"
                className="border-2 border-[#E8DFCA] text-[#5C4B4B] hover:bg-[#FFFBF0] rounded-xl"
                onClick={onHome}
              >
                <Home className="w-4 h-4 mr-2" /> {t("btn.home")}
              </Button>
              {!isFinal && (
                <Button
                  data-testid="reveal-continue-button"
                  onClick={onContinue}
                  className="bg-[#D92525] hover:bg-[#B81E1E] text-white font-bold rounded-xl shadow-[0_4px_0_0_#A31A1A] hover:shadow-[0_2px_0_0_#A31A1A] active:translate-y-1 active:shadow-none transition-all"
                >
                  {nextLabel} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
