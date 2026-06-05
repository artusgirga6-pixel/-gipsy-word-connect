import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tv, Skull } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

/**
 * Simulated full-screen AdModal. Designed so a real AdMob/AdSense call could be slotted
 * in by replacing the simulated countdown with the SDK callback (onAdClosed → onComplete).
 *
 * Props:
 *  - open: boolean
 *  - duration: countdown seconds (default 5)
 *  - reason: label shown ("ad_reward", "interstitial", "hint")
 *  - onComplete: invoked when the ad finishes (or user skips after countdown)
 */
export default function AdModal({ open, duration = 5, reason = "interstitial", onComplete }) {
  const { t } = useI18n();
  const [remaining, setRemaining] = useState(duration);

  useEffect(() => {
    if (!open) return;
    setRemaining(duration);
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [open, duration]);

  const skippable = remaining === 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
          data-testid="ad-modal"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="relative max-w-2xl w-full bg-gradient-to-br from-[#0c0c0c] via-[#1f0d0d] to-[#0c0c0c] border-2 border-[#F5A623] rounded-3xl overflow-hidden text-white"
          >
            <div className="absolute top-3 left-3 px-2 py-1 bg-[#F5A623] text-black rounded text-[10px] font-black uppercase tracking-widest">
              Reklamo
            </div>
            <div className="absolute top-3 right-3 text-[#F5A623] text-xs font-mono" data-testid="ad-countdown">
              {skippable ? "" : `${remaining}s`}
            </div>

            <div className="px-8 py-16 sm:py-24 text-center">
              <Tv className="w-16 h-16 mx-auto mb-6 text-[#F5A623]" />
              <div className="text-[10px] uppercase tracking-[0.25em] text-[#F5A623] mb-2">
                {reason === "hint_letter" ? "Ushtevipe — jekh akhor" : reason === "ad_reward" ? "Lo love — 50 lov" : "Akhardo reklamo"}
              </div>
              <h2
                className="text-3xl sm:text-5xl font-black mb-4"
                style={{ fontFamily: "Fredoka, sans-serif" }}
              >
                Gipsy Word Connect
              </h2>
              <p className="text-white/60 max-w-md mx-auto text-sm">
                Ažutim o Romano khelipe.
              </p>
            </div>

            <button
              data-testid="ad-skip-button"
              disabled={!skippable}
              onClick={() => skippable && onComplete?.()}
              className={[
                "w-full py-4 font-bold uppercase tracking-widest text-sm transition-colors",
                skippable
                  ? "bg-[#F5A623] text-black hover:bg-[#FFC04D] cursor-pointer"
                  : "bg-white/10 text-white/40 cursor-not-allowed",
              ].join(" ")}
            >
              {skippable ? "Phand · Continue" : `Užaras ${remaining}s…`}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
