import React, { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { fetchLeaderboard } from "@/lib/api";
import { Trophy, Crown } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

function formatTime(sec) {
  if (!sec) return "—";
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

export default function LeaderboardSheet({ open, onOpenChange, currentPlayerName }) {
  const { t } = useI18n();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setRows(null);
    setError(null);
    fetchLeaderboard(20)
      .then((data) => setRows(data))
      .catch((e) => setError(e?.message || "Failed"));
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="bg-[#FFFBF0] border-l-2 border-[#E8DFCA] sm:max-w-md w-full overflow-y-auto"
        data-testid="leaderboard-sheet"
      >
        <SheetHeader>
          <SheetTitle
            className="text-2xl text-[#1E3A8A] flex items-center gap-2"
            style={{ fontFamily: "Fredoka, sans-serif" }}
          >
            <Trophy className="w-6 h-6 text-[#F5A623]" /> {t("leaderboard.title")}
          </SheetTitle>
          <SheetDescription className="text-[#5C4B4B]">
            {t("app.subtitle")}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-2">
          {rows === null && !error && (
            <div className="text-[#5C4B4B] text-center py-8">…</div>
          )}
          {error && (
            <div className="text-[#D92525] text-center py-8">{error}</div>
          )}
          {rows && rows.length === 0 && (
            <div className="text-[#5C4B4B] text-center py-8">{t("leaderboard.empty")}</div>
          )}
          {rows && rows.length > 0 && (
            <div className="grid grid-cols-[36px_1fr_60px_70px] gap-2 items-center text-xs uppercase tracking-widest font-bold text-[#1E3A8A] px-2 mb-1">
              <div>{t("leaderboard.col.rank")}</div>
              <div>{t("leaderboard.col.name")}</div>
              <div className="text-right">{t("leaderboard.col.done")}</div>
              <div className="text-right">{t("leaderboard.col.time")}</div>
            </div>
          )}
          {rows && rows.map((r, idx) => {
            const isYou = currentPlayerName && r.name === currentPlayerName;
            return (
              <div
                key={idx}
                data-testid={`leaderboard-row-${idx}`}
                className={[
                  "grid grid-cols-[36px_1fr_60px_70px] gap-2 items-center p-2 rounded-xl border-2",
                  isYou
                    ? "bg-[#F5A623]/20 border-[#F5A623]"
                    : "bg-white border-[#E8DFCA]",
                ].join(" ")}
              >
                <div className="font-bold text-[#D92525] text-base flex items-center gap-1">
                  {idx === 0 ? <Crown className="w-4 h-4 text-[#F5A623]" /> : idx + 1}
                </div>
                <div className="font-semibold text-[#2D2323] truncate">
                  {r.name} {isYou && <span className="text-xs text-[#5C4B4B]">{t("leaderboard.you")}</span>}
                </div>
                <div className="text-right font-bold text-[#2B8C44]">{r.completed}</div>
                <div className="text-right text-sm text-[#5C4B4B] tabular-nums">
                  {formatTime(r.total_best_time)}
                </div>
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
