/**
 * Music sequencer for songs declared in resources().music.
 *
 * Song format:
 *   music: {
 *     main: {
 *       bpm: 140,            // beats per minute (default 120)
 *       loop: true,          // default true
 *       tracks: [
 *         { channel: 'pulse1', notes: 'E5 E5 -:0.5 C5:0.5 E5 G5:2', volume: 0.2, envelope: 'soft' },
 *         { channel: 'triangle', notes: 'C3:2 G2:2' },
 *         { channel: 'noise', period: 12, notes: 'C4 C4' }   // voice options: duty, period, vol, arp, vibrato
 *       ]
 *     }
 *   }
 *
 * Notes are space separated NOTE[:beats], NOTE is like C4, F#3, Bb4, or '-' for a rest; beats default to 1.
 * The sequencer is pure (no audio): advance(dt) returns the notes to start this frame.
 */

const CHANNELS = ['pulse1', 'pulse2', 'triangle', 'noise'];
const NOTE_RE = /^([A-G][#b]?[0-8]|-)(?::(\d*\.?\d+))?$/;
const MAX_TRACKS = 4;
const MAX_NOTES_PER_TRACK = 1024;

// Fraction of a note's length that it sounds, so repeated notes are distinct
const GATE = 0.9;

const DUTIES = [0.125, 0.25, 0.5, 0.75];
const MAX_MACRO_STEPS = 256;

/**
 * Check the NES-style voice options shared by sound effects and song tracks:
 * duty, period, vol/arp macros, vibrato and sweep curve. Only present options are checked.
 * @returns {string|null}
 */
export function checkVoice(def) {
  if (def.duty !== undefined && !DUTIES.includes(def.duty)) return `duty must be one of ${DUTIES.join(', ')}, got ${JSON.stringify(def.duty)}`;
  if (def.period !== undefined && !(Number.isInteger(def.period) && def.period >= 0 && def.period <= 15)) return `period must be an integer 0-15, got ${JSON.stringify(def.period)}`;
  for (const key of ['vol', 'arp']) {
    const values = def[key];
    if (values === undefined) continue;
    if (!Array.isArray(values) || values.length === 0 || values.length > MAX_MACRO_STEPS || !values.every(v => typeof v === 'number' && isFinite(v))) {
      return `${key} must be an array of 1-${MAX_MACRO_STEPS} numbers (one per 1/60s step)`;
    }
  }
  if (def.vol && def.vol.some(v => v < 0 || v > 1)) return 'vol values must be 0-1';
  if (def.arp && def.arp.some(v => Math.abs(v) > 48)) return 'arp values are semitones, at most 48 up or down';
  if (def.vibrato !== undefined && !(def.vibrato && typeof def.vibrato === 'object' && (def.vibrato.rate === undefined || def.vibrato.rate > 0))) return 'vibrato must be {rate: Hz, depth: semitones}';
  if (def.sweep?.curve !== undefined && !['linear', 'exp'].includes(def.sweep.curve)) return `sweep.curve must be 'linear' or 'exp'`;
  return null;
}

// Voice options a track passes on to every note it plays
const VOICE_KEYS = ['duty', 'period', 'vol', 'arp', 'macroLoop', 'vibrato'];

/**
 * Parse and validate a song definition
 * @param {Object} song - Song from resources().music
 * @returns {{song?: Object, error?: string}}
 */
export function parseSong(song) {
  if (!song || typeof song !== 'object') return { error: 'song must be an object' };

  const bpm = song.bpm ?? 120;
  if (typeof bpm !== 'number' || !(bpm >= 20 && bpm <= 400)) return { error: `bpm must be a number from 20 to 400, got ${JSON.stringify(song.bpm)}` };
  if (!Array.isArray(song.tracks) || song.tracks.length === 0) return { error: 'tracks must be a non-empty array' };
  if (song.tracks.length > MAX_TRACKS) return { error: `at most ${MAX_TRACKS} tracks, got ${song.tracks.length}` };

  const tracks = [];
  for (let t = 0; t < song.tracks.length; t++) {
    const track = song.tracks[t];
    if (!track || typeof track !== 'object') return { error: `track ${t} must be an object` };
    if (!CHANNELS.includes(track.channel)) return { error: `track ${t} channel must be one of ${CHANNELS.join(', ')}` };
    if (typeof track.notes !== 'string') return { error: `track ${t} notes must be a string like "C4 E4:0.5 -:2"` };
    const voiceError = checkVoice(track);
    if (voiceError) return { error: `track ${t} ${voiceError}` };

    const notes = [];
    for (const token of track.notes.trim().split(/\s+/).filter(Boolean)) {
      const match = token.match(NOTE_RE);
      if (!match) return { error: `track ${t} has bad note "${token}" (use NOTE[:beats] like C4, F#3:0.5, Bb2:2 or -:1 for a rest)` };
      const beats = match[2] === undefined ? 1 : parseFloat(match[2]);
      if (!(beats > 0)) return { error: `track ${t} note "${token}" must last more than 0 beats` };
      notes.push({ note: match[1] === '-' ? null : match[1], beats });
    }
    if (notes.length === 0) return { error: `track ${t} has no notes` };
    if (notes.length > MAX_NOTES_PER_TRACK) return { error: `track ${t} has ${notes.length} notes, max is ${MAX_NOTES_PER_TRACK}` };

    tracks.push({
      channel: track.channel,
      volume: typeof track.volume === 'number' ? Math.max(0, Math.min(1, track.volume)) : 0.2,
      envelope: track.envelope || 'soft',
      mode: track.mode,
      voice: Object.fromEntries(VOICE_KEYS.filter(key => track[key] !== undefined).map(key => [key, track[key]])),
      notes
    });
  }

  return { song: { bpm, loop: song.loop !== false, tracks } };
}

/**
 * Validate every song in resources().music
 * @returns {string|null} - First error, or null if all songs are valid
 */
export function checkMusic(music) {
  if (music === undefined) return null;
  if (!music || typeof music !== 'object' || Array.isArray(music)) return 'music must be an object of named songs';
  for (const [name, song] of Object.entries(music)) {
    const { error } = parseSong(song);
    if (error) return `music.${name}: ${error}`;
  }
  return null;
}

export class MusicPlayer {
  constructor(songs) {
    this.songs = {};
    for (const [name, def] of Object.entries(songs || {})) {
      const { song } = parseSong(def);
      if (song) this.songs[name] = song;
    }
    this.current = null;
    this.name = null;
  }

  /**
   * Switch songs. The same name keeps the current song playing; null or an unknown name stops.
   * @returns {boolean} - true if the playing song changed
   */
  play(name) {
    if (name === this.name) return false;
    this.name = name;
    const song = name != null ? this.songs[name] : null;
    this.current = song ? {
      song,
      beatSeconds: 60 / song.bpm,
      tracks: song.tracks.map(() => ({ index: -1, timeLeft: 0, done: false }))
    } : null;
    return true;
  }

  stop() {
    this.play(null);
  }

  /**
   * Advance by dt seconds
   * @returns {Array<{channel, note, duration, volume, envelope, mode, ...voice}>} - Notes that start now
   */
  advance(dt) {
    if (!this.current) return [];
    const { song, beatSeconds, tracks } = this.current;
    const events = [];

    song.tracks.forEach((track, t) => {
      const state = tracks[t];
      if (state.done) return;
      state.timeLeft -= dt;

      // Bounded so a huge dt (tab was in background) can't spin forever
      for (let guard = 0; state.timeLeft <= 0 && guard < track.notes.length; guard++) {
        state.index++;
        if (state.index >= track.notes.length) {
          if (!song.loop) { state.done = true; return; }
          state.index = 0;
        }
        const { note, beats } = track.notes[state.index];
        const length = beats * beatSeconds;
        state.timeLeft += length;
        if (note && state.timeLeft > 0) {
          events.push({
            channel: track.channel,
            note,
            duration: length * GATE,
            volume: track.volume,
            envelope: track.envelope,
            mode: track.mode,
            ...track.voice
          });
        }
      }
      // Fell far behind: resync instead of replaying missed notes
      if (state.timeLeft <= 0) state.timeLeft = 0;
    });

    return events;
  }
}
