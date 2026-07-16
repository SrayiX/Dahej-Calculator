/* ============================================================
   AUDIO
   Tiny procedural tones via Web Audio API — no audio files.
   Respects a mute toggle stored in state.
   ============================================================ */

import { state } from './core/state.js';

let ctx = null;

function getCtx() {
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    ctx = new AudioCtx();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone({ freq = 440, duration = 0.12, type = 'sine', gain = 0.06, delay = 0 }) {
  if (state.muted) return;
  const audioCtx = getCtx();
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;

  const startTime = audioCtx.currentTime + delay;
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.015);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

export const sound = {
  click() {
    tone({ freq: 720, duration: 0.07, type: 'sine', gain: 0.05 });
  },
  select() {
    tone({ freq: 560, duration: 0.09, type: 'sine', gain: 0.045 });
  },
  advance() {
    tone({ freq: 480, duration: 0.1, type: 'triangle', gain: 0.05 });
    tone({ freq: 640, duration: 0.12, type: 'triangle', gain: 0.04, delay: 0.05 });
  },
  back() {
    tone({ freq: 420, duration: 0.09, type: 'triangle', gain: 0.04 });
  },
  stamp() {
    tone({ freq: 140, duration: 0.18, type: 'square', gain: 0.05 });
    tone({ freq: 90, duration: 0.22, type: 'square', gain: 0.045, delay: 0.03 });
  },
  reveal() {
    tone({ freq: 523, duration: 0.16, type: 'sine', gain: 0.05 });
    tone({ freq: 659, duration: 0.18, type: 'sine', gain: 0.05, delay: 0.09 });
    tone({ freq: 784, duration: 0.24, type: 'sine', gain: 0.055, delay: 0.18 });
  },
  toggle(value) {
    tone({ freq: value ? 600 : 380, duration: 0.08, type: 'sine', gain: 0.04 });
  },
};

export function toggleMute() {
  state.muted = !state.muted;
  sound.toggle(!state.muted);
  return state.muted;
}
