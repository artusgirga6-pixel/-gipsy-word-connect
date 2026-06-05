import { useCallback, useEffect, useState } from "react";
import { initPlayer, fetchProgress, completeLevel, resetProgress } from "@/lib/api";

const STORAGE_KEY = "romword_player_id";

export function useProgress() {
  const [playerId, setPlayerId] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // bootstrap
  useEffect(() => {
    let cancelled = false;
    async function boot() {
      try {
        let id = localStorage.getItem(STORAGE_KEY);
        if (id) {
          try {
            const data = await fetchProgress(id);
            if (cancelled) return;
            setPlayerId(id);
            setProgress(data);
            setLoading(false);
            return;
          } catch (e) {
            // not found - create new
            localStorage.removeItem(STORAGE_KEY);
          }
        }
        const created = await initPlayer(null);
        if (cancelled) return;
        localStorage.setItem(STORAGE_KEY, created.player_id);
        setPlayerId(created.player_id);
        setProgress(created);
      } catch (e) {
        setError(e?.message || "Failed to load progress");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    boot();
    return () => { cancelled = true; };
  }, []);

  const markComplete = useCallback(
    async ({ level, phrase, translation, theme, timeSeconds }) => {
      if (!playerId) return null;
      const updated = await completeLevel({
        player_id: playerId,
        level,
        phrase,
        translation,
        theme,
        time_seconds: timeSeconds,
      });
      setProgress(updated);
      return updated;
    },
    [playerId]
  );

  const reset = useCallback(async () => {
    if (!playerId) return;
    const updated = await resetProgress(playerId);
    setProgress(updated);
  }, [playerId]);

  return { playerId, progress, loading, error, markComplete, reset };
}
