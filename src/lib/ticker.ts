/** @module lib/ticker: one rAF loop giving time and dt; pauses offscreen or hidden. @see src/scene/boot.ts, docs/MOTION.md (Idle animation) */

export type TickFn = (time: number, dt: number) => void;

const MAX_DT = 0.1; // clamp long frames so tweens and idle loops stay stable

export class Ticker {
  private fns = new Set<TickFn>();
  private raf = 0;
  private last = 0;
  private time = 0;
  private offscreen = false;

  constructor() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => this.sync());
    }
  }

  add(fn: TickFn): () => void {
    this.fns.add(fn);
    this.sync();
    return () => this.remove(fn);
  }

  remove(fn: TickFn): void {
    this.fns.delete(fn);
    this.sync();
  }

  /** Called by the owner of the IntersectionObserver. */
  setOffscreen(value: boolean): void {
    this.offscreen = value;
    this.sync();
  }

  private sync(): void {
    const shouldRun = this.fns.size > 0 && !this.offscreen && !document.hidden;
    if (shouldRun && this.raf === 0) {
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.loop);
    } else if (!shouldRun && this.raf !== 0) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    }
  }

  private loop = (now: number): void => {
    const dt = Math.min(MAX_DT, Math.max(0, (now - this.last) / 1000));
    this.last = now;
    this.time += dt;
    for (const fn of this.fns) fn(this.time, dt);
    if (this.fns.size > 0) this.raf = requestAnimationFrame(this.loop);
    else this.raf = 0;
  };
}

export const ticker = new Ticker();
