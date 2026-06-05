// Tiny Web Audio sound effects. No external assets.
// We expose play(name) for "find", "complete", "reveal", "milestone".

let ctx = null;
let muted = false;

const STORAGE_KEY = "romword_muted";
try {
  muted = localStorage.getItem(STORAGE_KEY) === "1";
} catch {}

function getCtx() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      ctx = new Ctx();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

function tone({ freq, duration = 0.15, type = "sine", gain = 0.18, attack = 0.005, release = 0.06, delay = 0 }) {
  const c = getCtx();
  if (!c) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + attack);
  g.gain.linearRampToValueAtTime(0, t0 + duration + release);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + duration + release + 0.02);
}

const PRESETS = {
  find: () => {
    tone({ freq: 660, duration: 0.08, type: "triangle", gain: 0.15 });
    tone({ freq: 990, duration: 0.1, type: "triangle", gain: 0.13, delay: 0.06 });
  },
  complete: () => {
    [523, 659, 784, 1047].forEach((f, i) =>
      tone({ freq: f, duration: 0.14, type: "triangle", gain: 0.16, delay: i * 0.09 })
    );
  },
  reveal: () => {
    // Sparkle arpeggio
    [880, 1175, 1568, 1976, 2349, 1568, 1175].forEach((f, i) =>
      tone({ freq: f, duration: 0.09, type: "sine", gain: 0.12, delay: i * 0.07 })
    );
  },
  milestone: () => {
    // Fanfare
    [392, 523, 659, 784, 988, 1175].forEach((f, i) =>
      tone({ freq: f, duration: 0.18, type: "square", gain: 0.08, delay: i * 0.11 })
    );
  },
  click: () => tone({ freq: 440, duration: 0.04, type: "square", gain: 0.06 }),
};

export function playSound(name) {
  if (muted) return;
  const fn = PRESETS[name];
  if (fn) fn();
}

export function isMuted() {
  return muted;
}

export function setMuted(value) {
  muted = !!value;
  try { localStorage.setItem(STORAGE_KEY, muted ? "1" : "0"); } catch {}
}

export function toggleMuted() {
  setMuted(!muted);
  return muted;
}
