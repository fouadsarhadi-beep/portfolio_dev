/** @module scene/rooms/translation/anim: idle loops of the language studio. @see docs/ROOMS.md (2 translation), docs/MOTION.md (Idle animation) */
import * as THREE from 'three';
import type { TranslationHandles } from './layout';

export interface Anim {
  update(time: number, dt: number, exposure: number): void;
  dispose(): void;
}

export function createAnim(room: THREE.Group, handles: TranslationHandles): Anim {
  const spinner = room.getObjectByName('globe')?.getObjectByName('spinner') ?? null;
  const headphones = handles.headphones;
  const headphoneBaseY = headphones?.position.y ?? 0;
  const bubbleBase = handles.bubbles.map((b) => b.rotation.z);

  // Screen swaps pairs at most twice per second (12 fps cap, docs/DESIGN.md).
  let swapClock = 0;
  let pair = 0;

  return {
    update(time, dt, _exposure) {
      // 1. Globe spins.
      if (spinner) spinner.rotation.y += dt * 0.8;

      // 2. The two bubbles pop in turn.
      handles.bubbles.forEach((b, i) => {
        const phase = 0.5 + 0.5 * Math.sin(time * 2.2 + i * Math.PI);
        b.scale.setScalar(0.85 + phase * 0.3);
        b.rotation.z = bubbleBase[i] + Math.sin(time * 1.5 + i) * 0.03;
      });

      // 3. Screen text swaps pairs; 4. the cursor blinks with each swap.
      swapClock += dt;
      if (swapClock > 0.5) {
        swapClock = 0;
        pair = (pair + 1) % 4;
        const c = (handles.screenTex.image as HTMLCanvasElement).getContext('2d');
        if (c) {
          handles.drawScreen(c, handles.screenSize.w, handles.screenSize.h, pair);
          handles.screenTex.needsUpdate = true;
        }
      }

      // 5. Headphones bob slightly.
      if (headphones) {
        headphones.position.y = headphoneBaseY + Math.sin(time * 3) * 0.008;
        headphones.rotation.z = Math.sin(time * 2.2) * 0.04;
      }
    },
    dispose() {
      // No per-instance GPU resources yet; T12 revisits disposal.
    },
  };
}
