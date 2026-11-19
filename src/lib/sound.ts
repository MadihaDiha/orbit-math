"use client";

import { useSyncExternalStore } from "react";

/**
 * Suara ORBIT MATH — disintesis langsung dengan Web Audio API (tanpa file audio):
 * musik latar luar angkasa (ambient) & efek suara. Bisa dinyalakan/dimatikan;
 * pilihan disimpan di localStorage. Musik hanya mulai setelah ada interaksi pengguna
 * (aturan autoplay browser).
 */
export type Sfx = "click" | "select" | "correct" | "wrong" | "complete" | "star" | "whoosh";

interface SoundSettings {
  music: boolean;
  sfx: boolean;
}

const KEY = "orbit-math-sound-v1";
const DEFAULTS: SoundSettings = { music: false, sfx: true };
let settings: SoundSettings | null = null;
const listeners = new Set<() => void>();

function load(): SoundSettings {
  if (settings) return settings;
  try {
    settings = { ...DEFAULTS, ...JSON.parse(window.localStorage.getItem(KEY) ?? "{}") };
  } catch {
    settings = { ...DEFAULTS };
  }
  return settings!;
}

function save(next: SoundSettings) {
  settings = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* abaikan */
  }
  listeners.forEach((l) => l());
}

export function useSoundSettings(): SoundSettings {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    load,
    () => DEFAULTS,
  );
}

// ------------------------------------------------------------------ audio
let ctx: AudioContext | null = null;
let master: GainNode | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", vol = 0.25, glideTo?: number) {
  const c = audio();
  if (!c || !master) return;
  const t = c.currentTime + start;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(master);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

/** Memainkan efek suara (bila efek suara aktif). */
export function playSfx(name: Sfx) {
  if (typeof window === "undefined" || !load().sfx) return;
  switch (name) {
    case "click":
      tone(660, 0, 0.08, "triangle", 0.15);
      break;
    case "select":
      tone(880, 0, 0.07, "sine", 0.18);
      tone(1320, 0.04, 0.08, "sine", 0.1);
      break;
    case "correct":
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.07, 0.22, "triangle", 0.2));
      break;
    case "wrong":
      tone(320, 0, 0.18, "sawtooth", 0.08, 220);
      tone(240, 0.14, 0.25, "triangle", 0.12, 170);
      break;
    case "complete":
      [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => tone(f, i * 0.09, 0.35, "triangle", 0.2));
      tone(1567.98, 0.5, 0.6, "sine", 0.15);
      break;
    case "star":
      [1568, 2093, 2637].forEach((f, i) => tone(f, i * 0.05, 0.25, "sine", 0.1));
      break;
    case "whoosh":
      tone(180, 0, 0.6, "sawtooth", 0.05, 900);
      break;
  }
}

// ------------------------------------------------------------------ musik
let musicNodes: { stop: () => void } | null = null;

const CHORDS = [
  [261.63, 329.63, 392.0, 493.88], // Cmaj7
  [220.0, 261.63, 329.63, 392.0], // Am7
  [174.61, 220.0, 261.63, 329.63], // Fmaj7
  [196.0, 246.94, 293.66, 392.0], // G
];

function startMusic() {
  const c = audio();
  if (!c || !master || musicNodes) return;
  const bus = c.createGain();
  bus.gain.value = 0;
  bus.gain.linearRampToValueAtTime(0.18, c.currentTime + 3);
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 900;
  const lfo = c.createOscillator();
  const lfoGain = c.createGain();
  lfo.frequency.value = 0.07;
  lfoGain.gain.value = 400;
  lfo.connect(lfoGain).connect(filter.frequency);
  lfo.start();
  filter.connect(bus).connect(master);

  let step = 0;
  let voices: OscillatorNode[] = [];
  const playChord = () => {
    const now = c.currentTime;
    voices.forEach((v) => v.stop(now + 2));
    voices = [];
    for (const f of CHORDS[step % CHORDS.length]) {
      for (const detune of [-6, 6]) {
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = "sine";
        o.frequency.value = f / 2;
        o.detune.value = detune;
        g.gain.setValueAtTime(0.0001, now);
        g.gain.exponentialRampToValueAtTime(0.06, now + 2);
        g.gain.setValueAtTime(0.06, now + 7);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 10);
        o.connect(g).connect(filter);
        o.start(now);
        o.stop(now + 10.2);
        voices.push(o);
      }
    }
    // bintang berkelip (nada tinggi acak)
    const sparkle = CHORDS[step % CHORDS.length][Math.floor(Math.random() * 4)] * 4;
    if (load().music) tone(sparkle, 1 + Math.random() * 4, 1.2, "sine", 0.03);
    step++;
  };
  playChord();
  const timer = window.setInterval(playChord, 8000);

  musicNodes = {
    stop: () => {
      window.clearInterval(timer);
      const now = c.currentTime;
      bus.gain.cancelScheduledValues(now);
      bus.gain.setValueAtTime(bus.gain.value, now);
      bus.gain.linearRampToValueAtTime(0, now + 1.2);
      window.setTimeout(() => {
        voices.forEach((v) => {
          try {
            v.stop();
          } catch {
            /* sudah berhenti */
          }
        });
        lfo.stop();
        bus.disconnect();
      }, 1400);
    },
  };
}

function stopMusic() {
  musicNodes?.stop();
  musicNodes = null;
}

export function setMusic(on: boolean) {
  save({ ...load(), music: on });
  if (on) startMusic();
  else stopMusic();
}

export function setSfx(on: boolean) {
  save({ ...load(), sfx: on });
  if (on) playSfx("click");
}

/** Dipanggil setelah interaksi pertama: lanjutkan musik bila sebelumnya dinyalakan. */
export function resumeMusicIfEnabled() {
  if (load().music) startMusic();
}
