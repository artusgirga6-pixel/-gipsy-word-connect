import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Music, Music2 } from "lucide-react";

/**
 * MusicPlayer
 * Procedurally generates simple Romani-style folk melodies via Web Audio.
 * Switches "song" automatically every 5 levels (URL-based).
 * Controlled mute persists in localStorage.
 *
 * 10 distinct melodies (loops) — picked by ((levelBlock) % 10).
 */
const STORAGE_KEY = "romword_music_off";

// Romani-folk-style scales (harmonic minor / hungarian gypsy on A and D)
const MELODIES = [
  // Each entry: { tempo (bpm), pattern: [[semitone_offset, durationBeats], ...] }
  { root: 220.0, tempo: 96, scale: [0, 2, 3, 6, 7, 8, 11, 12], pattern: [[0,1],[2,1],[3,0.5],[2,0.5],[0,2],[3,1],[5,1],[7,2]] }, // A gypsy
  { root: 220.0, tempo: 112, scale: [0, 2, 3, 5, 7, 8, 10, 12], pattern: [[7,0.5],[5,0.5],[3,1],[2,1],[0,2],[3,1],[5,1],[7,2]] },
  { root: 196.0, tempo: 88, scale: [0, 1, 4, 5, 7, 8, 11, 12], pattern: [[0,1],[4,0.5],[5,0.5],[4,1],[0,1],[7,2],[5,1],[4,1]] }, // G hijaz
  { root: 247.0, tempo: 104, scale: [0, 2, 3, 5, 7, 9, 10, 12], pattern: [[0,1],[3,1],[5,0.5],[7,0.5],[5,1],[3,1],[2,2],[0,2]] }, // B minor
  { root: 165.0, tempo: 120, scale: [0, 2, 3, 5, 7, 8, 11, 12], pattern: [[5,0.5],[7,0.5],[8,1],[7,1],[5,1],[3,1],[2,2],[0,2]] }, // E gypsy
  { root: 293.66, tempo: 132, scale: [0, 2, 3, 5, 7, 8, 11, 12], pattern: [[0,0.5],[3,0.5],[5,0.5],[7,0.5],[5,1],[3,1],[2,1],[0,1]] }, // D gypsy upbeat
  { root: 261.63, tempo: 100, scale: [0, 1, 4, 5, 7, 8, 11, 12], pattern: [[0,1],[1,0.5],[0,0.5],[4,1],[5,1],[7,2],[4,1],[0,1]] }, // C hijaz
  { root: 220.0, tempo: 76, scale: [0, 2, 3, 6, 7, 8, 11, 12], pattern: [[7,1.5],[5,0.5],[3,1],[2,1],[0,2],[3,2],[5,2]] }, // slow ballad
  { root: 196.0, tempo: 144, scale: [0, 2, 4, 5, 7, 9, 11, 12], pattern: [[0,0.5],[4,0.5],[7,0.5],[12,0.5],[11,0.5],[7,0.5],[5,0.5],[4,0.5],[2,0.5],[0,1.5]] }, // fast
  { root: 174.61, tempo: 92, scale: [0, 2, 3, 5, 7, 8, 11, 12], pattern: [[0,1],[3,0.5],[5,0.5],[7,1],[8,0.5],[7,0.5],[5,1],[3,1],[2,1],[0,2]] }, // F minor
];

function noteFreq(root, semitones) {
  return root * Math.pow(2, semitones / 12);
}

function startMelody(ctx, melodyIdx, gainNode) {
  const m = MELODIES[melodyIdx % MELODIES.length];
  const beat = 60 / m.tempo;
  let t = ctx.currentTime + 0.1;

  const stops = [];
  let cancelled = false;

  const play = () => {
    if (cancelled) return;
    for (const [step, dur] of m.pattern) {
      const f = noteFreq(m.root, m.scale[step % m.scale.length] + (step >= 12 ? 12 : 0));
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(f, t);
      const len = dur * beat * 0.95;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.5, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + len);
      osc.connect(g).connect(gainNode);
      osc.start(t);
      osc.stop(t + len + 0.05);
      stops.push(osc);

      // bass note on downbeats
      if (Number.isInteger(Math.round((t - ctx.currentTime) / beat))) {
        const bass = ctx.createOscillator();
        const bg = ctx.createGain();
        bass.type = "sine";
        bass.frequency.setValueAtTime(m.root / 2, t);
        bg.gain.setValueAtTime(0, t);
        bg.gain.linearRampToValueAtTime(0.32, t + 0.02);
        bg.gain.exponentialRampToValueAtTime(0.0001, t + beat * 0.9);
        bass.connect(bg).connect(gainNode);
        bass.start(t);
        bass.stop(t + beat * 0.95);
        stops.push(bass);
      }
      t += dur * beat;
    }
    const totalDur = t - ctx.currentTime;
    // Schedule next loop
    setTimeout(play, Math.max(50, (totalDur - 0.2) * 1000));
  };
  play();

  return () => {
    cancelled = true;
    for (const o of stops) { try { o.stop(); } catch {} }
  };
}

export default function MusicPlayer() {
  const location = useLocation();
  const ctxRef = useRef(null);
  const gainRef = useRef(null);
  const stopRef = useRef(null);
  const [muted, setMuted] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === "1"; } catch { return false; }
  });
  const [currentMelody, setCurrentMelody] = useState(-1);

  // Determine which melody index from current URL
  const melodyIdx = (() => {
    const m = location.pathname.match(/\/level\/(\d+)/);
    if (!m) return 0;
    const lvl = parseInt(m[1], 10);
    return Math.floor((lvl - 1) / 5) % MELODIES.length;
  })();

  // Start/stop based on mute and melodyIdx
  useEffect(() => {
    if (muted) {
      if (stopRef.current) { stopRef.current(); stopRef.current = null; }
      setCurrentMelody(-1);
      return;
    }
    if (currentMelody === melodyIdx) return;
    // Start new melody
    if (!ctxRef.current) {
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        ctxRef.current = new Ctx();
        gainRef.current = ctxRef.current.createGain();
        gainRef.current.gain.value = 0.06;
        gainRef.current.connect(ctxRef.current.destination);
      } catch { return; }
    }
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume().catch(() => {});
    }
    if (stopRef.current) stopRef.current();
    stopRef.current = startMelody(ctxRef.current, melodyIdx, gainRef.current);
    setCurrentMelody(melodyIdx);
  }, [muted, melodyIdx, currentMelody]);

  // Cleanup on unmount
  useEffect(() => () => { if (stopRef.current) stopRef.current(); }, []);

  const toggle = () => {
    const next = !muted;
    setMuted(next);
    try { localStorage.setItem(STORAGE_KEY, next ? "1" : "0"); } catch {}
  };

  return (
    <button
      onClick={toggle}
      data-testid="music-toggle"
      className="fixed bottom-3 right-3 z-40 w-11 h-11 rounded-full bg-white/90 border-2 border-[#E8DFCA] shadow-[0_3px_0_0_#E8DFCA] flex items-center justify-center hover:scale-105 transition-transform"
      title={muted ? "Play music" : "Mute music"}
    >
      {muted ? <Music2 className="w-5 h-5 text-[#5C4B4B] opacity-50" /> : <Music className="w-5 h-5 text-[#D92525]" />}
    </button>
  );
}
