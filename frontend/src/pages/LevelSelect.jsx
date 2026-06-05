import React from "react";
import { Link } from "react-router-dom";
import { LEVELS } from "@/data/levels";
import { Lock, Check, Crown, Sparkles, RotateCcw, Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useProgress } from "@/hooks/useProgress";

export default function LevelSelect() {
  const { progress, loading, reset } = useProgress();
  const completed = new Set(progress?.completed_levels || []);
  const current = progress?.current_level || 1;
  const total = LEVELS.length;
  const pct = Math.round((completed.size / total) * 100);

  return (
    <div className="min-h-screen bg-[#FFFBF0] relative overflow-x-hidden">
      {/* Folk pattern overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1740083652679-439b3dd548d3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwxfHxjb2xvcmZ1bCUyMGZsb3JhbCUyMGZvbGslMjBwYXR0ZXJufGVufDB8fHx8MTc4MDY2ODEwNXww&ixlib=rb-4.1.0&q=85)",
          backgroundSize: "260px",
          backgroundRepeat: "repeat",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <header className="mb-10 sm:mb-14">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-[#D92525] uppercase tracking-[0.18em] text-xs sm:text-sm font-bold mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Romské hledání slov
              </div>
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2D2323]"
                style={{ fontFamily: "Fredoka, sans-serif" }}
                data-testid="page-title"
              >
                30 úrovní · 30 vtipných frází
              </h1>
              <p className="mt-3 max-w-2xl text-[#5C4B4B] text-base sm:text-lg">
                Najdi všechna slova a zbylá písmena ti odhalí skrytou romskou frázi.
                Poslední úroveň skrývá speciální vítězné kouzlo.
              </p>
            </div>
            <Button
              data-testid="reset-progress-button"
              variant="outline"
              onClick={() => {
                if (window.confirm("Opravdu resetovat postup?")) reset();
              }}
              className="border-2 border-[#E8DFCA] text-[#5C4B4B] rounded-xl hover:bg-white"
            >
              <RotateCcw className="w-4 h-4 mr-2" /> Reset
            </Button>
          </div>

          <div className="mt-8 p-5 rounded-2xl bg-white/80 border-2 border-[#E8DFCA] backdrop-blur shadow-[0_6px_0_0_#E8DFCA]">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm uppercase tracking-[0.12em] font-bold text-[#1E3A8A]">
                Postup
              </div>
              <div className="text-sm font-semibold text-[#5C4B4B]" data-testid="progress-count">
                {completed.size} / {total} dokončeno
              </div>
            </div>
            <Progress value={pct} className="h-3 bg-[#E8DFCA]" />
          </div>
        </header>

        {loading ? (
          <div className="text-center text-[#5C4B4B] py-20">Načítám postup…</div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
            {LEVELS.map((lvl) => {
              const isDone = completed.has(lvl.id);
              const isUnlocked = lvl.id <= current || isDone;
              const isMilestone = lvl.isMilestone;
              const isFinal = lvl.isFinal;
              const span = isMilestone ? "col-span-2 row-span-2" : "";

              const base =
                "relative aspect-square rounded-3xl flex flex-col items-center justify-center p-2 transition-all border-2 font-bold";
              const stateCls = !isUnlocked
                ? "bg-[#D1C7B1]/60 text-[#8A7C68] border-[#D1C7B1] cursor-not-allowed"
                : isDone
                ? "bg-[#2B8C44] text-white border-[#1F6E33] hover:scale-105 shadow-[0_4px_0_0_#1F6E33]"
                : isFinal
                ? "bg-gradient-to-br from-[#F5A623] to-[#D92525] text-white border-[#A31A1A] hover:scale-105 hover:rotate-1 shadow-[0_6px_0_0_#A31A1A]"
                : isMilestone
                ? "bg-[#1E3A8A] text-white border-[#152965] hover:scale-105 hover:rotate-1 shadow-[0_4px_0_0_#152965]"
                : "bg-white text-[#2D2323] border-[#E8DFCA] hover:bg-[#FFFBF0] hover:scale-105 hover:rotate-1 shadow-[0_4px_0_0_#E8DFCA]";

              const inner = (
                <div className={`${base} ${stateCls} ${span}`} data-testid={`level-button-${lvl.id}`}>
                  {!isUnlocked && <Lock className="w-5 h-5 mb-1" />}
                  {isDone && <Check className="w-5 h-5 mb-1 absolute top-2 right-2" />}
                  {isFinal && <Crown className="w-6 h-6 mb-1" />}
                  <div className={`${isMilestone ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl"} leading-none`}>
                    {lvl.id}
                  </div>
                  {isMilestone && (
                    <div className="text-[10px] sm:text-xs uppercase tracking-widest mt-1 opacity-90 text-center px-1">
                      {isFinal ? "Finále" : "Milník"}
                    </div>
                  )}
                  {!isMilestone && (
                    <div className="text-[10px] sm:text-xs mt-1 opacity-70 truncate max-w-full px-1">
                      {lvl.title}
                    </div>
                  )}
                </div>
              );

              return isUnlocked ? (
                <Link key={lvl.id} to={`/level/${lvl.id}`} className={span}>
                  {inner}
                </Link>
              ) : (
                <div key={lvl.id} className={span}>{inner}</div>
              );
            })}
          </div>
        )}

        {/* Discovered phrases */}
        {progress?.discovered_phrases?.length > 0 && (
          <section className="mt-14">
            <h2
              className="text-2xl sm:text-3xl font-bold text-[#1E3A8A] mb-4 flex items-center gap-2"
              style={{ fontFamily: "Fredoka, sans-serif" }}
            >
              <Trophy className="w-6 h-6 text-[#F5A623]" /> Objevené fráze
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" data-testid="discovered-phrases">
              {progress.discovered_phrases
                .slice()
                .sort((a, b) => a.level - b.level)
                .map((p) => (
                  <div
                    key={p.level}
                    className="rounded-2xl bg-white/80 border-2 border-[#E8DFCA] p-4 backdrop-blur"
                  >
                    <div className="text-xs uppercase tracking-widest font-bold text-[#D92525]">
                      Úroveň {p.level} · {p.theme}
                    </div>
                    <div className="text-lg font-bold text-[#F5A623] mt-1" style={{ fontFamily: "Fredoka, sans-serif" }}>
                      {p.phrase}
                    </div>
                    {p.translation && (
                      <div className="text-sm text-[#5C4B4B] italic">„{p.translation}"</div>
                    )}
                  </div>
                ))}
            </div>
          </section>
        )}

        <footer className="mt-16 text-center text-sm text-[#5C4B4B]/70">
          Romské hledání slov · Vytvořeno s láskou ♥
        </footer>
      </div>
    </div>
  );
}
