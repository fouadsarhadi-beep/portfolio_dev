/** @module scene/stack/state: scroll-derived step, the u and e arrays, the invariant, window.__stack. @see docs/MOTION.md (Scroll mapping, State, Debug), src/scene/stack/motion.ts */
import { LIFT, SLAB_T, STACK_BASE_Y } from '@/config/tuning';
import { LAYERS } from '@/config/layers';
import * as THREE from 'three';

export const N = LAYERS.length;
export const STEPS = N - 1;
export const STEP_PX_FACTOR = 0.8; // STEP_PX = 0.8 x innerHeight (docs/MOTION.md)

const OPEN_AT = 0.35;  // open to m+1 when s >= m + 0.35
const CLOSE_AT = 0.15; // close to m-1 when s < m - 1 + 0.15

const easeOutCubic = (x: number): number => 1 - Math.pow(1 - x, 3);
const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));

export interface StackState {
  ids: string[];
  restY: number[];
  u: number[];
  e: number[];
  step: number;
  s: number;
  onChange: ((from: number, to: number) => void) | null;
  updateFromScroll(scrollY: number, viewportH: number, stageTop: number): void;
  sync(): void;
  apply(slabs: THREE.Object3D[], rooms: Array<{ group: THREE.Group; layerIndex: number }>): void;
  publish(): void;
}

export function createState(): StackState {
  const ids = LAYERS.map((l) => l.id);
  const restY = LAYERS.map((_, i) => STACK_BASE_Y + (N - 1 - i) * SLAB_T);
  const u = new Array<number>(N).fill(0);
  const e = new Array<number>(N).fill(0);
  const state: StackState = {
    ids,
    restY,
    u,
    e,
    step: 0,
    s: 0,
    onChange: null,

    updateFromScroll(scrollY, viewportH, stageTop) {
      const stepPx = STEP_PX_FACTOR * viewportH;
      state.s = Math.min(STEPS, Math.max(0, (scrollY - stageTop) / stepPx));
      let m = state.step;
      while (m < STEPS && state.s >= m + OPEN_AT) m++;
      while (m > 0 && state.s < m - 1 + CLOSE_AT) m--;
      if (m !== state.step) {
        const from = state.step;
        state.step = m;
        state.onChange?.(from, m);
      }
    },

    // Hard invariant, enforced every frame after tween updates (docs/MOTION.md).
    sync() {
      for (let i = N - 2; i >= 0; i--) {
        if (u[i] < u[i + 1]) u[i] = u[i + 1];
      }
      for (let i = 0; i < N; i++) {
        e[i] = i === 0 ? 1 : clamp01((u[i - 1] - u[i]) / LIFT);
      }
    },

    apply(slabs, rooms) {
      for (let i = 0; i < N; i++) {
        slabs[i].position.y = restY[i] + u[i];
      }
      for (const { group, layerIndex } of rooms) {
        // The detail view forces its room to e = 1 (docs/MOTION.md Detail view).
        const exposure = group.userData.forceExpose === true ? 1 : e[layerIndex];
        const punch = typeof group.userData.punch === 'number' ? group.userData.punch : 1;
        group.visible = exposure >= 0.02;
        const eased = easeOutCubic(exposure);
        group.scale.set(punch, Math.max(0.0001, eased * punch), punch);
      }
    },

    publish() {
      (window as unknown as Record<string, unknown>).__stack = {
        step: state.step,
        u: [...u],
        e: [...e],
        restY: [...restY],
        ids,
      };
    },
  };
  return state;
}
