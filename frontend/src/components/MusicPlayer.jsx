import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Music, Music2 } from "lucide-react";

/**
 * MusicPlayer
 * Plays Romani / Gypsy background music. Behaviour:
 *
 * 1. Attempts to load /music/track-1.mp3 … /music/track-N.mp3 from the public folder.
 *    Drop your own royalty-free MP3 files there and they will rotate automatically
 *    every 5 levels.
 * 2. If no real tracks are found, falls back to a procedural Hungarian-Gypsy-style
 *    melody generated live via the Web Audio API.
 *
 * Mute persists in localStorage. Audio is only started after the first user
 * gesture (browser autoplay policy).
 */

const STORAGE_KEY = "romword_music_off";
const TRACK_COUNT = 8;

// Try a track URL and resolve true on success, false on failure (HEAD probe).
function probeTrack(url) {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.preload = "metadata";
    const cleanup = () => {
      audio.removeEventListener("loadedmetadata", onOk);
      audio.removeEventListener("error", onErr);
    };
    const onOk = () => { cleanup(); resolve(true); };
    const onErr = () => { cleanup(); resolve(false); };
    audio.addEventListener("loadedmetadata", onOk);
    audio.addEventListener("error", onErr);
    audio.src = url;
    setTimeout(() => { cleanup(); resolve(false); }, 2500);
  });
}

// ---- Procedural Gypsy-style melody (Hungarian/Gypsy minor scale) ----

// Hungarian gypsy minor scale (intervals in semitones from root): 0 2 3 6 7 8 11
const MELODIES = [
  { root: 220.00, tempo: 100, pattern: "0,1|2,0.5|3,0.5|6,1|7,1|6,0.5|3,0.5|2,1|0,2" },
  { root: 246.94, tempo: 116, pattern: "7,0.5|6,0.5|3,1|2,1|0,1|3,0.5|6,0.5|7,2|6,1|3,1" },
  { root: 196.00, tempo: 92,  pattern: "0,1|3,1|6,0.5|7,0.5|6,1|3,1|2,2|0,2" },
  { root: 261.63, tempo: 124, pattern: "0,0.5|3,0.5|6,0.5|7,0.5|6,1|3,1|2,0.5|0,0.5|2,1|0,2" },
  { root: 174.61, tempo: 88,  pattern: "0,1.5|3,0.5|6,1|7,1|11,1|7,1|6,1|3,1|0,2" },
  { root: 233.08, tempo: 132, pattern: "11,0.5|7,0.5|6,0.5|3,0.5|2,0.5|0,1|3,1|6,1|7,2" },
  { root: 207.65, tempo: 96,  pattern: "0,1|2,1|3,1|6,1|7,1|6,1|3,1|2,1|0,2" },
  { root: 293.66, tempo: 140, pattern: "0,0.5|3,0.5|2,0.5|0,0.5|6,0.5|7,0.5|3,0.5|0,1|7,1|6,2" },
];

function noteFreq(root, semitones) {
  return root * Math.pow(2, semitones / 12);
}

function startProcedural(ctx, melodyIdx, gainNode) {
  const m = MELODIES[melodyIdx % MELODIES.length];
  const beat = 60 / m.tempo;
  const steps = m.pattern.split("|").map((s) => s.split(",").map(Number));

  let cancelled = false;
  let lookAhead = ctx.currentTime + 0.1;
  let osc;

  const play = () => {
    if (cancelled) return;
    for (const [step, dur] of steps) {
      const f = noteFreq(m.root, step + (step >= 12 ? 12 : 0));
      // Lead (violin-ish: triangle + small detuned sawtooth)
      const o1 = ctx.createOscillator();
      const o2 = ctx.createOscillator();
      const g = ctx.createGain();
      o1.type = "triangle";
      o2.type = "sawtooth";
      o1.frequency.setValueAtTime(f, lookAhead);
      o2.frequency.setValueAtTime(f * 1.005, lookAhead); // mild detune
      const len = dur * beat * 0.95;
      g.gain.setValueAtTime(0, lookAhead);
      g.gain.linearRampToValueAtTime(0.55, lookAhead + 0.03);
      // Slight vibrato during the note
      const vib = ctx.createOscillator();
      const vibGain = ctx.createGain();
      vib.frequency.setValueAtTime(5.5, lookAhead);
      vibGain.gain.setValueAtTime(f * 0.012, lookAhead);
      vib.connect(vibGain);
      vibGain.connect(o1.frequency);
      vib.start(lookAhead);
      vib.stop(lookAhead + len);
      g.gain.exponentialRampToValueAtTime(0.001, lookAhead + len);
      o1.connect(g);
      o2.connect(g);
      g.connect(gainNode);
      o1.start(lookAhead);
      o2.start(lookAhead);
      o1.stop(lookAhead + len + 0.05);
      o2.stop(lookAhead + len + 0.05);

      // Bass on each beat
      const bass = ctx.createOscillator();
      const bg = ctx.createGain();
      bass.type = "sine";
      bass.frequency.setValueAtTime(m.root / 2, lookAhead);
      bg.gain.setValueAtTime(0, lookAhead);
      bg.gain.linearRampToValueAtTime(0.36, lookAhead + 0.02);
      bg.gain.exponentialRampToValueAtTime(0.001, lookAhead + beat * 0.85);
      bass.connect(bg).connect(gainNode);
      bass.start(lookAhead);
      bass.stop(lookAhead + beat * 0.9);

      lookAhead += dur * beat;
    }
    const totalDur = lookAhead - ctx.currentTime;
    setTimeout(play, Math.max(50, (totalDur - 0.2) * 1000));
  };
  play();
  return () => { cancelled = true; if (osc) try { osc.stop(); } catch {} };
}

export default function MusicPlayer() {
  const location = useLocation();
  const ctxRef = useRef(null);
  const gainRef = useRef(null);
  const audioRef = useRef(null);   // HTMLAudioElement when playing a real track
  const stopRef = useRef(null);    // procedural stop fn
  const [muted, setMuted] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === "1"; } catch { return false; }
  });
  const [unlocked, setUnlocked] = useState(false);
  const [tracksAvailable, setTracksAvailable] = useState(null); // array of available URLs or [] for proc
  const [current, setCurrent] = useState(-1);

  // Unlock audio on first user gesture
  useEffect(() => {
    const unlock = () => {
      setUnlocked(true);
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  // Probe for local /music/*.mp3 tracks
  useEffect(() => {
    if (!unlocked) return;
    if (tracksAvailable !== null) return;
    (async () => {
      const found = [];
      for (let i = 1; i <= TRACK_COUNT; i++) {
        const url = `${process.env.PUBLIC_URL || ""}/music/track-${i}.mp3`;
        if (await probeTrack(url)) found.push(url);
      }
      setTracksAvailable(found);
    })();
  }, [unlocked, tracksAvailable]);

  // Which slot is current (based on URL level)
  const slotIdx = (() => {
    const m = location.pathname.match(/\/level\/(\d+)/);
    if (!m) return 0;
    const lvl = parseInt(m[1], 10);
    return Math.floor((lvl - 1) / 5);
  })();

  // Start playback
  useEffect(() => {
    if (!unlocked || tracksAvailable === null) return;
    if (muted) {
      if (audioRef.current) { try { audioRef.current.pause(); } catch {} audioRef.current = null; }
      if (stopRef.current) { stopRef.current(); stopRef.current = null; }
      setCurrent(-1);
      return;
    }
    if (current === slotIdx) return;
    // Stop previous
    if (audioRef.current) { try { audioRef.current.pause(); } catch {} audioRef.current = null; }
    if (stopRef.current) { stopRef.current(); stopRef.current = null; }

    if (tracksAvailable.length > 0) {
      const url = tracksAvailable[slotIdx % tracksAvailable.length];
      const audio = new Audio(url);
      audio.loop = true;
      audio.volume = 0.35;
      audio.play().catch(() => {});
      audioRef.current = audio;
    } else {
      // Procedural fallback
      if (!ctxRef.current) {
        try {
          const Ctx = window.AudioContext || window.webkitAudioContext;
          ctxRef.current = new Ctx();
          gainRef.current = ctxRef.current.createGain();
          gainRef.current.gain.value = 0.06;
          gainRef.current.connect(ctxRef.current.destination);
        } catch { return; }
      }
      if (ctxRef.current.state === "suspended") ctxRef.current.resume().catch(() => {});
      stopRef.current = startProcedural(ctxRef.current, slotIdx, gainRef.current);
    }
    setCurrent(slotIdx);
  }, [unlocked, muted, slotIdx, current, tracksAvailable]);

  useEffect(() => () => {
    if (audioRef.current) { try { audioRef.current.pause(); } catch {} }
    if (stopRef.current) stopRef.current();
  }, []);

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
      {muted
        ? <Music2 className="w-5 h-5 text-[#5C4B4B] opacity-50" />
        : <Music className="w-5 h-5 text-[#D92525]" />}
    </button>
  );
}
