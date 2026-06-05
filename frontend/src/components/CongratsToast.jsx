import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Star } from "lucide-react";
import { getCongrats } from "@/data/congratsPhrases";

export default function CongratsToast({ open, level, onDone }) {
  const c = getCongrats(level);

  React.useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => onDone?.(), 2400);
    return () => clearTimeout(id);
  }, [open, onDone]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -80, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -80, scale: 0.8 }}
          transition={{ type: "spring", damping: 16, stiffness: 220 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[55] pointer-events-none"
          data-testid="congrats-toast"
        >
          <div className="relative px-7 py-5 rounded-3xl bg-gradient-to-r from-[#F5A623] via-[#FFCB45] to-[#F5A623] border-4 border-white shadow-[0_10px_30px_rgba(245,166,35,0.55)]">
            <Star className="absolute -top-3 -left-3 w-8 h-8 text-[#D92525] fill-[#D92525] animate-pulse" />
            <Star className="absolute -top-2 -right-2 w-6 h-6 text-[#1E3A8A] fill-[#1E3A8A] animate-pulse" style={{ animationDelay: "120ms" }} />
            <Sparkles className="absolute -bottom-3 -right-4 w-7 h-7 text-[#1E3A8A]" />
            <div
              className="text-2xl sm:text-4xl font-black text-[#2D2323] text-center drop-shadow-sm"
              style={{ fontFamily: "Fredoka, sans-serif" }}
              data-testid="congrats-phrase"
            >
              {c.phrase}
            </div>
            <div className="text-xs sm:text-sm text-[#5C4B4B] text-center mt-1 italic">
              „{c.translation}"
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
