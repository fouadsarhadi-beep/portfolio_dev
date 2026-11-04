/** @module scene/stack/motion: GSAP tweens on the u array; lift and slam timings per MOTION.md. @see docs/MOTION.md (Lift, Slam), src/scene/stack/state.ts, src/scene/stack/landing.ts */
import { gsap } from 'gsap';
import { LIFT } from '@/config/tuning';
import { prefersReducedMotion } from '@/lib/reduced-motion';

// Triggered motions must land in wall-clock time even when frames are slow
// (software rendering): without this, lagSmoothing makes tweens crawl.
gsap.ticker.lagSmoothing(0);

const LIFT_DUR = 1.1;      // power2.inOut (docs/MOTION.md Lift)
const LIFT_STAGGER = 0.25; // multi-step jumps stagger, top first
const SLAM_DUR = 0.42;     // power4.in (docs/MOTION.md Slam)
const SLAM_STAGGER = 0.07; // lowest lifted layer starts first

interface Wrapper { v: number }

export interface Motion {
  goTo(step: number): void;
  step: number;
  dispose(): void;
}

export function createMotion(
  u: number[],
  n: number,
  opts: { onLand: (index: number) => void },
): Motion {
  const wrappers: Wrapper[] = u.map((v) => ({ v }));
  const motion: Motion = {
    step: 0,
    dispose() {
      wrappers.forEach((w) => gsap.killTweensOf(w));
    },

    goTo(target: number) {
      const reduced = prefersReducedMotion();
      const from = motion.step;
      motion.step = target;
      if (target === from) return;

      if (target > from) {
        // Lift layers from..target-1, top layer first (docs/MOTION.md Lift).
        for (let i = from; i < target; i++) {
          schedule(i, LIFT, reduced ? 0.2 : LIFT_DUR, (i - from) * (reduced ? 0 : LIFT_STAGGER), 'power2.inOut', null);
        }
      } else {
        // Slam layers target..from-1 down; the lowest lifted layer starts first.
        for (let i = target; i < from; i++) {
          const delay = (from - 1 - i) * (reduced ? 0 : SLAM_STAGGER);
          schedule(i, 0, reduced ? 0.2 : SLAM_DUR, delay, 'power4.in', () => opts.onLand(i));
        }
      }
    },
  };

  function schedule(index: number, targetV: number, duration: number, delay: number, ease: string, onLand: (() => void) | null): void {
    const w = wrappers[index];
    gsap.killTweensOf(w);
    w.v = u[index]; // resume from wherever the killed tween left this layer
    gsap.to(w, {
      v: targetV,
      duration,
      delay,
      ease,
      onUpdate: () => {
        u[index] = w.v;
      },
      onComplete: () => {
        u[index] = targetV;
        w.v = targetV;
        onLand?.();
      },
    });
  }

  return motion;
}
