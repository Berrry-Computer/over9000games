/**
 * Per-frame timing: how long each part of a frame takes and how evenly frames arrive.
 * Toggle the on-screen readout with the backquote key (`) or ?perf in the URL;
 * window.__frameStats.summary() returns the same numbers for scripts.
 */

const WINDOW = 120; // frames kept, about 2 seconds at 60fps
const LONG_FRAME_MS = 25; // a frame interval above this is a visible hitch at 60Hz
const PARTS = ['update', 'commands', 'music', 'render'];

export class FrameStats {
  constructor() {
    this.frames = []; // {interval, update, commands, music, render, total}
    this.current = null;
    this.partStart = 0;
    this.lastFrameStart = 0;
    this.overlay = null;
    this.overlayTimer = 0;
    this.pendingInput = null; // timeStamp of the oldest key/touch not yet seen by a frame
    this.inputDelays = []; // ms from input event to the frame that reads it
    this.audioLatency = () => null; // set by the game runner: seconds of audio output delay

    if (typeof window !== 'undefined') {
      window.__frameStats = this;
      if (/[?&]perf\b/.test(window.location.search)) this.toggleOverlay();
      window.addEventListener('keydown', (e) => {
        if (e.code === 'Backquote') this.toggleOverlay();
      });
      for (const type of ['keydown', 'pointerdown', 'touchstart']) {
        window.addEventListener(type, (e) => {
          if (this.pendingInput === null) this.pendingInput = e.timeStamp;
        }, { capture: true, passive: true });
      }
    }
  }

  beginFrame() {
    const now = performance.now();
    this.current = { interval: this.lastFrameStart ? now - this.lastFrameStart : 0, start: now };
    for (const part of PARTS) this.current[part] = 0;
    this.lastFrameStart = now;
    if (this.pendingInput !== null) {
      this.inputDelays.push(now - this.pendingInput);
      if (this.inputDelays.length > 20) this.inputDelays.shift();
      this.pendingInput = null;
    }
  }

  begin() {
    this.partStart = performance.now();
  }

  end(part) {
    if (this.current) this.current[part] += performance.now() - this.partStart;
  }

  endFrame() {
    if (!this.current) return;
    this.current.total = performance.now() - this.current.start;
    this.frames.push(this.current);
    if (this.frames.length > WINDOW) this.frames.shift();
    this.current = null;

    if (this.overlay && performance.now() - this.overlayTimer > 250) {
      this.overlayTimer = performance.now();
      this.overlay.textContent = this.format();
    }
  }

  /**
   * @returns {{fps, frames, longFrames, interval: {avg, max}, total: {avg, max}, update: {avg, max}, ...}}
   */
  summary() {
    const frames = this.frames.filter(f => f.interval > 0);
    const stat = (key) => {
      const values = frames.map(f => f[key]);
      if (!values.length) return { avg: 0, p95: 0, max: 0 };
      const sorted = [...values].sort((a, b) => a - b);
      return {
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        p95: sorted[Math.floor(sorted.length * 0.95)],
        max: sorted[sorted.length - 1]
      };
    };
    const interval = stat('interval');
    const result = {
      fps: interval.avg ? 1000 / interval.avg : 0,
      frames: frames.length,
      longFrames: frames.filter(f => f.interval > LONG_FRAME_MS).length,
      interval,
      total: stat('total')
    };
    for (const part of PARTS) result[part] = stat(part);
    result.input = {
      avg: this.inputDelays.length ? this.inputDelays.reduce((a, b) => a + b, 0) / this.inputDelays.length : 0,
      max: this.inputDelays.length ? Math.max(...this.inputDelays) : 0
    };
    const audio = this.audioLatency();
    result.audioLatency = audio === null ? null : audio * 1000;
    return result;
  }

  format() {
    const s = this.summary();
    const ms = (v) => v.toFixed(1).padStart(5);
    const rows = [
      `fps ${s.fps.toFixed(0)}  hitches ${s.longFrames}/${s.frames}`,
      `            avg   p95   max`,
      `interval ${ms(s.interval.avg)} ${ms(s.interval.p95)} ${ms(s.interval.max)}`,
      `work     ${ms(s.total.avg)} ${ms(s.total.p95)} ${ms(s.total.max)}`
    ];
    for (const part of PARTS) rows.push(`${part.padEnd(8)} ${ms(s[part].avg)} ${ms(s[part].p95)} ${ms(s[part].max)}`);
    rows.push(`input    ${ms(s.input.avg)}       ${ms(s.input.max)}  (key to frame)`);
    rows.push(`audio out ${s.audioLatency === null ? '  n/a' : s.audioLatency.toFixed(0) + 'ms'}`);
    return rows.join('\n');
  }

  toggleOverlay() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
      return;
    }
    this.overlay = document.createElement('pre');
    this.overlay.style.cssText = 'position:fixed;top:4px;left:4px;z-index:10000;margin:0;padding:4px 6px;' +
      'background:rgba(0,0,0,0.75);color:#7f7;font:11px/1.3 monospace;pointer-events:none;';
    this.overlay.textContent = 'measuring...';
    document.body.appendChild(this.overlay);
  }
}
