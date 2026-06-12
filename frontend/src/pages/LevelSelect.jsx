import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LEVELS } from "@/data/levels";
import { Lock, Check, Crown, Sparkles, RotateCcw, Trophy, Share2, Type } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useProgress } from "@/hooks/useProgress";
import { useI18n } from "@/i18n/I18nContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import LeaderboardSheet from "@/components/LeaderboardSheet";
import OnboardingModal from "@/components/OnboardingModal";
import CoinsDisplay from "@/components/CoinsDisplay";
import { shareOrCopy } from "@/lib/share";
import { toast } from "sonner";

const ONBOARDING_KEY = "romword_onboarded";

const TYPE_ICON = {
  word_search: Type,
};

export default function LevelSelect() {
  const { progress, loading, reset, saveName } = useProgress();
  const { t } = useI18n();
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  useEffect(() => {
    if (loading || !progress) return;
    try {
      const done = localStorage.getItem(ONBOARDING_KEY);
      if (!done && !progress.name) setOnboardingOpen(true);
    } catch {}
  }, [loading, progress]);

  const closeOnboarding = (name) => {
    try { localStorage.setItem(ONBOARDING_KEY, "1"); } catch {}
    if (name && name.length > 0) {
      saveName(name).catch(() => {});
    }
    setOnboardingOpen(false);
  };

  const completed = new Set(progress?.completed_levels || []);
  const current = progress?.current_level || 1;
  const bestTimes = progress?.best_times || {};
  const total = LEVELS.length;
  const pct = Math.round((completed.size / total) * 100);

  const handleShareProgress = async () => {
    const phrases = progress?.discovered_phrases || [];
    const lastTwo = phrases.slice(-2).map((p) => `«${p.phrase}»`).join(", ");
    const text = `${t("app.subtitle")} — ${completed.size}/${total} ${t("btn.done")}.${lastTwo ? " " + lastTwo : ""}`;
    const status = await shareOrCopy({ title: t("app.subtitle"), text });
    if (status === "copied") toast.success(t("reveal.copied"));
  };

  return (
    <div className="min-h-screen bg-[#FFFBF0] relative overflow-x-hidden">
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
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-[#D92525] uppercase tracking-[0.18em] text-xs sm:text-sm font-bold mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> {t("app.subtitle")}
                {progress?.name && (
                  <span className="ml-2 text-[#5C4B4B] normal-case tracking-normal text-xs">
                    · {progress.name}
                  </span>
                )}
              </div>
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2D2323]"
                style={{ fontFamily: "Fredoka, sans-serif" }}
                data-testid="page-title"
              >
                {t("app.title")}
              </h1>
              <p className="mt-3 max-w-2xl text-[#5C4B4B] text-base sm:text-lg">
                {t("app.intro")}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <CoinsDisplay coins={progress?.coins ?? 0} />
              <LanguageSwitcher />
              <Button
                data-testid="leaderboard-button"
                variant="outline"
                onClick={() => setLeaderboardOpen(true)}
                className="border-2 border-[#1E3A8A] text-[#1E3A8A] rounded-xl bg-white/70 hover:bg-[#1E3A8A] hover:text-white"
              >
                <Trophy className="w-4 h-4 mr-2" /> {t("btn.leaderboard")}
              </Button>
              <Button
                data-testid="share-progress-button"
                variant="outline"
                onClick={handleShareProgress}
                className="border-2 border-[#E8DFCA] text-[#5C4B4B] rounded-xl bg-white/70 hover:bg-white"
              >
                <Share2 className="w-4 h-4 mr-2" /> {t("btn.share")}
              </Button>
              <Button
                data-testid="reset-progress-button"
                variant="outline"
                onClick={() => {
                  if (window.confirm(t("btn.reset.confirm"))) reset();
                }}
                className="border-2 border-[#E8DFCA] text-[#5C4B4B] rounded-xl bg-white/70 hover:bg-white"
              >
                <RotateCcw className="w-4 h-4 mr-2" /> {t("btn.reset")}
              </Button>
            </div>
          </div>

          <div className="mt-8 p-5 rounded-2xl bg-white/80 border-2 border-[#E8DFCA] backdrop-blur shadow-[0_6px_0_0_#E8DFCA]">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm uppercase tracking-[0.12em] font-bold text-[#1E3A8A]">
                {t("progress.label")}
              </div>
              <div className="text-sm font-semibold text-[#5C4B4B]" data-testid="progress-count">
                {t("progress.count", { done: completed.size, total })}
              </div>
            </div>
            <Progress value={pct} className="h-3 bg-[#E8DFCA]" />
          </div>
        </header>

        {loading ? (
          <div className="text-center text-[#5C4B4B] py-20">…</div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
            {LEVELS.map((lvl) => {
              const isDone = completed.has(lvl.id);
              const isUnlocked = lvl.id <= current || isDone;
              const isMilestone = lvl.isMilestone;
              const isFinal = lvl.isFinal;
              const best = bestTimes[String(lvl.id)];
              const span = isMilestone ? "col-span-2 row-span-2" : "";

              const base =
                "relative aspect-square rounded-3xl flex flex-col items-center justify-center p-2 transition-all border-2 font-bold overflow-hidden";
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
                  {/* Type indicator icon */}
                  {(() => {
                    const Icon = TYPE_ICON[lvl.type] || Type;
                    return <Icon className="absolute top-2 left-2 w-3.5 h-3.5 opacity-60" />;
                  })()}
                  {!isUnlocked && <Lock className="w-5 h-5 mb-1" />}
                  {isDone && <Check className="w-5 h-5 absolute top-2 right-2" />}
                  {isFinal && <Crown className="w-6 h-6 mb-1" />}
                  <div className={`${isMilestone ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl"} leading-none`}>
                    {lvl.id}
                  </div>
                  {isMilestone && (
                    <div className="text-[10px] sm:text-xs uppercase tracking-widest mt-1 opacity-90 text-center px-1">
                      {isFinal ? t("milestone.final") : t("milestone.label")}
                    </div>
                  )}
                  {!isMilestone && (
                    <div className="text-[10px] sm:text-xs mt-1 opacity-70 truncate max-w-full px-1">
                      {lvl.title || lvl.theme}
                    </div>
                  )}
                  {best != null && (
                    <div className="absolute bottom-1 left-1 right-1 text-[9px] sm:text-[10px] text-center opacity-80 font-mono tabular-nums" data-testid={`level-best-${lvl.id}`}>
                      ★ {best}s
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

        {progress?.discovered_phrases?.length > 0 && (
          <section className="mt-14">
            <h2
              className="text-2xl sm:text-3xl font-bold text-[#1E3A8A] mb-4 flex items-center gap-2"
              style={{ fontFamily: "Fredoka, sans-serif" }}
            >
              <Trophy className="w-6 h-6 text-[#F5A623]" /> {t("discovered.title")}
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
                      {t("game.level", { id: p.level, total })} · {p.theme}
                    </div>
                    <div className="text-lg font-bold text-[#F5A623] mt-1" style={{ fontFamily: "Fredoka, sans-serif" }}>
                      {p.phrase}
                    </div>
                    {p.translation && (
                      <div className="text-sm text-[#5C4B4B] italic">„{p.translation}"</div>
                    )}
                    {p.time_seconds != null && (
                      <div className="text-xs text-[#2B8C44] mt-1 font-semibold">★ {p.time_seconds}s</div>
                    )}
                  </div>
                ))}
            </div>
          </section>
        )}

        <footer className="mt-16 text-center text-sm text-[#5C4B4B]/70">
          {t("footer.text")}
        </footer>
      </div>

      <LeaderboardSheet
        open={leaderboardOpen}
        onOpenChange={setLeaderboardOpen}
        currentPlayerName={progress?.name}
      />
      <OnboardingModal
        open={onboardingOpen}
        onSubmit={closeOnboarding}
        onSkip={() => closeOnboarding("")}
      />
    </div>
  );
}
