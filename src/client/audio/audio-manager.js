// ============================================================================
// NES-Style Audio Manager
// Single-file audio system with slot-based sound management
// ============================================================================

// ----------------------------------------------------------------------------
// Note Frequency Calculation
// ----------------------------------------------------------------------------

const SEMITONE_RATIOS = [
  1.0000, // C
  1.0595, // C#
  1.1225, // D
  1.1892, // D#
  1.2599, // E
  1.3348, // F
  1.4142, // F#
  1.4983, // G
  1.5874, // G#
  1.6818, // A
  1.7818, // A#
  1.8877, // B
];

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const C2_FREQ = 65.41;

/**
 * Convert note name to frequency (e.g., 'C4' -> 261.63 Hz)
 */
function noteToFrequency(note) {
  const match = note.match(/^([A-G])([#b]?)(\d)$/);
  if (!match) return 440; // Default to A4

  const [, letter, accidental, octaveStr] = match;
  let octave = parseInt(octaveStr, 10);
  let semitone = NOTE_NAMES.indexOf(letter) + (accidental === '#' ? 1 : accidental === 'b' ? -1 : 0);

  // Cb wraps down to B of the previous octave, B# up to C of the next
  if (semitone < 0) { semitone += 12; octave -= 1; }
  if (semitone > 11) { semitone -= 12; octave += 1; }

  const ratio = SEMITONE_RATIOS[semitone];
  const octaveMultiplier = Math.pow(2, octave - 2);

  return C2_FREQ * ratio * octaveMultiplier;
}

// ----------------------------------------------------------------------------
// Envelope Presets
// ----------------------------------------------------------------------------

const ENVELOPE_PRESETS = {
  sharp: { attack: 0.01, decay: 0.05, sustain: 0.3, release: 0.05 },
  soft: { attack: 0.05, decay: 0.1, sustain: 0.6, release: 0.1 },
  fade: { attack: 0.02, decay: 0.3, sustain: 0.2, release: 0.2 },
  sustain: { attack: 0.01, decay: 0.02, sustain: 0.8, release: 0.1 },
};

function resolveEnvelope(envelope) {
  if (typeof envelope === 'string') {
    return ENVELOPE_PRESETS[envelope] || ENVELOPE_PRESETS.sharp;
  }
  return envelope || ENVELOPE_PRESETS.sharp;
}

/**
 * Schedule attack/decay/sustain/release on a gain. Short sounds squeeze the
 * stages to fit their duration, so they still reach full volume and fade cleanly.
 * Looping sounds hold the sustain level until the slot stops them.
 */
function applyEnvelope(gain, now, duration, volume, envelope, loop) {
  const stages = envelope.attack + envelope.decay + (loop ? 0 : envelope.release);
  const fit = !loop && stages > duration ? duration / stages : 1;
  const attack = envelope.attack * fit;
  const decay = envelope.decay * fit;
  const release = envelope.release * fit;
  const sustainLevel = envelope.sustain * volume;

  gain.setValueAtTime(0, now);
  gain.linearRampToValueAtTime(volume, now + attack);
  gain.linearRampToValueAtTime(sustainLevel, now + attack + decay);
  if (loop) return;
  gain.setValueAtTime(sustainLevel, now + duration - release);
  gain.linearRampToValueAtTime(0, now + duration);
}

// Sound macros step at the NES frame rate, like a tracker instrument
const MACRO_STEP = 1 / 60;
const LOOPING_MACRO_SECONDS = 30; // how far ahead a looping macro is scheduled

/**
 * Per-frame macros: `vol` (0-1 multipliers, replaces the envelope) and `arp`
 * (semitone offsets). Each holds its last value, or repeats with macroLoop.
 */
function applyMacros(def, gain, pitchParam, pitchToValue, now, duration, volume, loop) {
  const span = loop ? LOOPING_MACRO_SECONDS : duration;
  for (const [values, apply] of [
    [def.vol, (v, t) => gain.setValueAtTime(volume * v, t)],
    [def.arp, (v, t) => pitchParam.setValueAtTime(pitchToValue(v), t)]
  ]) {
    if (!Array.isArray(values) || values.length === 0 || (values === def.arp && !pitchParam)) continue;
    const steps = def.macroLoop ? Math.ceil(span / MACRO_STEP) : Math.min(values.length, Math.ceil(span / MACRO_STEP));
    for (let i = 0; i < steps; i++) apply(values[i % values.length], now + i * MACRO_STEP);
  }
  if (Array.isArray(def.vol) && def.vol.length && !loop) {
    // Short fade at the end so a held value doesn't click off
    gain.setValueAtTime(volume * def.vol[Math.min(def.vol.length, Math.ceil(duration / MACRO_STEP)) - 1], Math.max(now, now + duration - 0.005));
    gain.linearRampToValueAtTime(0, now + duration);
  }
}

// Pulse duty cycles as band-limited waves; 0.5 is the plain square wave
const pulseWaves = new WeakMap(); // ctx -> Map(duty -> PeriodicWave)
function pulseWave(ctx, duty) {
  if (!pulseWaves.has(ctx)) pulseWaves.set(ctx, new Map());
  const cache = pulseWaves.get(ctx);
  if (!cache.has(duty)) {
    const harmonics = 64;
    const real = new Float32Array(harmonics);
    const imag = new Float32Array(harmonics);
    for (let n = 1; n < harmonics; n++) {
      real[n] = Math.sin(2 * Math.PI * n * duty) / (Math.PI * n);
      imag[n] = (1 - Math.cos(2 * Math.PI * n * duty)) / (Math.PI * n);
    }
    cache.set(duty, ctx.createPeriodicWave(real, imag));
  }
  return cache.get(duty);
}

/**
 * Pulse and triangle voices. Options beyond the basics:
 *   duty: 0.125 | 0.25 | 0.5 | 0.75 (pulse only)
 *   sweep: {target, time, curve: 'linear' | 'exp'}
 *   vibrato: {rate: Hz, depth: semitones}
 *   arp / vol / macroLoop: per-frame macros (see applyMacros)
 *   loop: keep playing until the slot is stopped
 */
function playToneSound(ctx, soundDef, destination, waveform) {
  const freq = soundDef.frequency || noteToFrequency(soundDef.note || 'A4');
  const duration = soundDef.duration || 0.2;
  const volume = soundDef.volume ?? 0.5;
  const envelope = resolveEnvelope(soundDef.envelope);
  const loop = !!soundDef.loop;

  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  if (waveform === 'square' && soundDef.duty && soundDef.duty !== 0.5) {
    osc.setPeriodicWave(pulseWave(ctx, soundDef.duty));
  } else {
    osc.type = waveform;
  }
  osc.frequency.value = freq;

  if (soundDef.sweep) {
    const targetFreq = soundDef.sweep.target || noteToFrequency(soundDef.sweep.targetNote || 'A4');
    const sweepTime = soundDef.sweep.time || duration;
    osc.frequency.setValueAtTime(freq, now); // Safari ramps from the last event, not from .value
    if (soundDef.sweep.curve === 'exp') {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, targetFreq), now + sweepTime);
    } else {
      osc.frequency.linearRampToValueAtTime(targetFreq, now + sweepTime);
    }
  }

  const gainNode = ctx.createGain();
  gainNode.gain.value = 0;

  if (Array.isArray(soundDef.vol) && soundDef.vol.length) {
    gainNode.gain.setValueAtTime(0, now);
  } else {
    applyEnvelope(gainNode.gain, now, duration, volume, envelope, loop);
  }
  applyMacros(soundDef, gainNode.gain, osc.detune, semitones => semitones * 100, now, duration, volume, loop);

  let lfo = null;
  if (soundDef.vibrato) {
    lfo = ctx.createOscillator();
    lfo.frequency.value = soundDef.vibrato.rate || 6;
    const depth = ctx.createGain();
    depth.gain.value = (soundDef.vibrato.depth ?? 0.3) * 100; // semitones -> cents
    lfo.connect(depth);
    depth.connect(osc.detune);
    lfo.start(now);
  }

  osc.connect(gainNode);
  gainNode.connect(destination);

  osc.start(now);
  const stopTime = loop ? Infinity : now + duration;
  if (!loop) {
    osc.stop(stopTime);
    lfo?.stop(stopTime);
  }

  return { osc, lfo, gainNode, stopTime };
}

// NES noise periods in CPU cycles (NTSC); index 0 is the thinnest hiss, 15 the deepest rumble
const NES_CPU_HZ = 1789773;
const NES_NOISE_PERIODS = [4, 8, 16, 32, 64, 96, 128, 160, 202, 254, 380, 508, 762, 1016, 2034, 4068];
const noiseBuffers = new WeakMap(); // ctx -> Map(key -> AudioBuffer)

/**
 * One second of NES-style noise: a 15-bit shift register clocked at the chosen
 * period. 'random' taps bit 1 (long hiss); 'periodic' taps bit 6, a 93-step loop
 * that sounds metallic and pitched.
 */
function nesNoiseBuffer(ctx, mode, period) {
  if (!noiseBuffers.has(ctx)) noiseBuffers.set(ctx, new Map());
  const cache = noiseBuffers.get(ctx);
  const key = `${mode}:${period}`;
  if (!cache.has(key)) {
    const length = ctx.sampleRate;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    const clocksPerSample = NES_CPU_HZ / NES_NOISE_PERIODS[period] / ctx.sampleRate;
    const tap = mode === 'periodic' ? 6 : 1;
    let register = 1;
    let phase = 0;
    for (let i = 0; i < length; i++) {
      for (phase += clocksPerSample; phase >= 1; phase--) {
        const feedback = (register & 1) ^ ((register >> tap) & 1);
        register = (register >> 1) | (feedback << 14);
      }
      data[i] = register & 1 ? -1 : 1;
    }
    cache.set(key, buffer);
  }
  return cache.get(key);
}

// Noise without a period keeps the original generator, so older games sound the same
function legacyNoiseBuffer(ctx, mode, duration) {
  const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  if (mode === 'periodic') {
    const period = 32;
    const pattern = new Array(period);
    for (let i = 0; i < period; i++) {
      pattern[i] = Math.random() * 2 - 1;
    }
    for (let i = 0; i < bufferSize; i++) {
      data[i] = pattern[i % period];
    }
  } else {
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  }
  return buffer;
}

/**
 * Noise voice. period: 0-15 picks the NES pitch (needed for looping noise);
 * arp/vol macros, envelope and loop work like the tone voices.
 */
function playNoiseSound(ctx, soundDef, destination) {
  const duration = soundDef.duration || 0.2;
  const volume = soundDef.volume ?? 0.5;
  const envelope = resolveEnvelope(soundDef.envelope);
  const hasPeriod = Number.isInteger(soundDef.period);
  const loop = !!soundDef.loop && hasPeriod;

  const now = ctx.currentTime;

  const source = ctx.createBufferSource();
  if (hasPeriod) {
    source.buffer = nesNoiseBuffer(ctx, soundDef.mode === 'periodic' ? 'periodic' : 'random', Math.max(0, Math.min(15, soundDef.period)));
    source.loop = true;
  } else {
    source.buffer = legacyNoiseBuffer(ctx, soundDef.mode, duration);
  }

  const gainNode = ctx.createGain();
  gainNode.gain.value = 0;

  if (Array.isArray(soundDef.vol) && soundDef.vol.length) {
    gainNode.gain.setValueAtTime(0, now);
  } else {
    applyEnvelope(gainNode.gain, now, duration, volume, envelope, loop);
  }
  // arp on noise shifts the playback rate, like stepping through noise periods
  applyMacros(soundDef, gainNode.gain, source.playbackRate, semitones => Math.pow(2, semitones / 12), now, duration, volume, loop);

  source.connect(gainNode);
  gainNode.connect(destination);

  source.start(now);
  const stopTime = loop ? Infinity : now + duration;
  if (!loop) source.stop(stopTime);

  return { source, gainNode, stopTime };
}

function playPulseSound(ctx, soundDef, destination) {
  return playToneSound(ctx, soundDef, destination, 'square');
}

function playTriangleSound(ctx, soundDef, destination) {
  return playToneSound(ctx, soundDef, destination, 'triangle');
}

// Exported for scripts that render sounds offline
export { playPulseSound, playTriangleSound, playNoiseSound };

// ----------------------------------------------------------------------------
// Sound Slot Management
// ----------------------------------------------------------------------------

/**
 * Stop a playing voice with a few milliseconds of fade so it doesn't click
 */
function stopNodes(ctx, nodes) {
  try {
    const now = ctx.currentTime;
    if (nodes.stopTime > now) {
      nodes.gainNode.gain.cancelScheduledValues(now);
      nodes.gainNode.gain.setTargetAtTime(0, now, 0.005);
    }
    const end = now + 0.03;
    (nodes.osc || nodes.source).stop(end);
    nodes.lfo?.stop(end);
  } catch (e) {
    // Already stopped
  }
}

function createSoundSlot(slotId) {
  return {
    slotId,
    currentSoundId: null,
    activeNodes: null,
    isLooping: false,
  };
}

// ----------------------------------------------------------------------------
// AudioManager Class
// ----------------------------------------------------------------------------

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.slots = [];
    this.musicNodes = new Set(); // notes started by the music sequencer, outside the 8 slots
    this.muted = false;
    this.initialized = false;
    this.unlocked = false;
    this._listenForUnlock();
  }

  /**
   * iOS only lets audio start from touchend/click/keydown (not touchstart), so
   * retry on every such gesture anywhere on the page until the context runs
   */
  _listenForUnlock() {
    if (typeof document === 'undefined') return;
    const unlock = () => this.tryResume();
    for (const type of ['touchend', 'click', 'keydown', 'pointerup']) {
      document.addEventListener(type, unlock, { capture: true, passive: true });
    }
  }

  async initialize() {
    if (this.initialized) return;

    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);

    for (let i = 0; i < 8; i++) {
      this.slots[i] = createSoundSlot(i);
    }

    this.initialized = true;
  }

  async resume() {
    if (this.ctx?.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  /**
   * Synchronous one-time resume attempt for user gesture handlers.
   * Call this directly in touch/click event handlers to satisfy Safari's autoplay policy.
   * Safe to call multiple times - only attempts resume once.
   */
  tryResume() {
    if (!this.ctx) {
      // Initialize synchronously if not done yet
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);

        for (let i = 0; i < 8; i++) {
          this.slots[i] = createSoundSlot(i);
        }

        this.initialized = true;
        console.log("Audio context created synchronously on user gesture");
      } catch (error) {
        console.warn("Failed to create audio context:", error);
        return;
      }
    }

    // iOS mutes Web Audio while the ringer switch is on silent unless the page asks for playback
    if (navigator.audioSession && navigator.audioSession.type !== 'playback') {
      try {
        navigator.audioSession.type = 'playback';
      } catch (e) {
        // Older Safari: no audio session API
      }
    }

    // Resume synchronously if not running: 'suspended' before a gesture, 'interrupted' in Safari
    // after a call or backgrounding
    if (this.ctx.state !== 'running' && this.ctx.state !== 'closed') {
      this.ctx.resume().then(() => {
        console.log("Audio context resumed on user gesture");
      }).catch(err => {
        console.warn("Audio resume failed:", err);
      });
    }

    // Older iOS only unlocks output after a sound is started inside the gesture
    if (!this.unlocked) {
      try {
        const source = this.ctx.createBufferSource();
        source.buffer = this.ctx.createBuffer(1, 1, this.ctx.sampleRate);
        source.connect(this.ctx.destination);
        source.start(0);
        this.unlocked = true;
      } catch (e) {
        // Try again on the next gesture
      }
    }
  }

  processCommands(commands) {
    if (!this.initialized || !this.ctx) return;

    const slotCommands = new Map();

    for (const cmd of commands) {
      if (cmd.type === 'sound') {
        slotCommands.set(cmd.slotId, cmd);
      } else if (cmd.type === 'audio') {
        this._processGlobalCommand(cmd);
      }
    }

    for (let i = 0; i < 8; i++) {
      const command = slotCommands.get(i);
      this._updateSlot(this.slots[i], command);
    }

    const now = this.ctx.currentTime;
    for (const slot of this.slots) {
      if (slot.activeNodes && !slot.isLooping && slot.activeNodes.stopTime <= now) {
        this._stopSlot(slot);
      }
    }
  }

  _updateSlot(slot, command) {
    // A slot not sent this frame keeps playing a one-shot to the end of its
    // duration; only looping sounds stop as soon as the game stops sending them
    if (!command) {
      if (slot.isLooping) this._stopSlot(slot);
      return;
    }

    if (command.soundId === null) {
      this._stopSlot(slot);
      return;
    }

    // If soundId is provided, use it to detect same sound
    // Otherwise treat as one-shot that restarts each frame
    const soundId = command.soundId || `inline_${slot.slotId}`;

    if (soundId === slot.currentSoundId && this._isSlotPlaying(slot)) {
      return; // Continue playing, don't restart
    }

    this._stopSlot(slot);
    this._startSlot(slot, command, soundId);
  }

  _startSlot(slot, command, soundId) {
    if (!command.channel) {
      console.warn('Sound command missing channel:', command);
      return;
    }

    const channel = command.channel;
    let activeNodes;

    try {
      switch (channel) {
        case 'pulse1':
        case 'pulse2':
          activeNodes = playPulseSound(this.ctx, command, this.masterGain);
          break;
        case 'triangle':
          activeNodes = playTriangleSound(this.ctx, command, this.masterGain);
          break;
        case 'noise':
          activeNodes = playNoiseSound(this.ctx, command, this.masterGain);
          break;
        default:
          console.warn(`Unknown channel: ${channel}`);
          return;
      }

      slot.currentSoundId = soundId;
      slot.activeNodes = activeNodes;
      slot.isLooping = command.loop || false;
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  _stopSlot(slot) {
    if (slot.activeNodes) {
      stopNodes(this.ctx, slot.activeNodes);
      slot.activeNodes = null;
    }
    slot.currentSoundId = null;
    slot.isLooping = false;
  }

  _isSlotPlaying(slot) {
    if (!slot.activeNodes) return false;
    if (slot.isLooping) return true;
    return slot.activeNodes.stopTime > this.ctx.currentTime;
  }

  _processGlobalCommand(cmd) {
    if (cmd.masterVolume !== undefined) {
      this.masterGain.gain.value = cmd.masterVolume;
    }
    if (cmd.mute !== undefined) {
      this.muted = cmd.mute;
      this.masterGain.gain.value = cmd.mute ? 0 : 1;
    }
  }

  /**
   * Play one note from the music sequencer; music doesn't use the 8 sound effect slots
   */
  playMusicNote(note) {
    if (!this.initialized || !this.ctx) return;

    let nodes;
    try {
      switch (note.channel) {
        case 'pulse1':
        case 'pulse2':
          nodes = playPulseSound(this.ctx, note, this.masterGain);
          break;
        case 'triangle':
          nodes = playTriangleSound(this.ctx, note, this.masterGain);
          break;
        case 'noise':
          nodes = playNoiseSound(this.ctx, note, this.masterGain);
          break;
        default:
          return;
      }
    } catch (error) {
      console.error('Error playing music note:', error);
      return;
    }

    this.musicNodes.add(nodes);
    (nodes.osc || nodes.source).onended = () => this.musicNodes.delete(nodes);
  }

  stopMusic() {
    for (const nodes of this.musicNodes) {
      stopNodes(this.ctx, nodes);
    }
    this.musicNodes.clear();
  }

  cleanup() {
    this.stopMusic();
    for (const slot of this.slots) {
      this._stopSlot(slot);
    }
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    this.initialized = false;
  }
}
