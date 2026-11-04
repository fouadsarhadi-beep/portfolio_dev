/** @module scene/rooms/cms/anim: idle loops of the publishing studio. @see docs/ROOMS.md (6 cms), docs/MOTION.md (Idle animation) */
import * as THREE from 'three';
import { drawBlocks, drawCalendar, type CmsHandles } from './layout';

export interface Anim {
  update(time: number, dt: number, exposure: number): void;
  dispose(): void;
}

export function createAnim(handles: CmsHandles): Anim {
  const blockClock = { t: 0 };
  const calClock = { t: 0 };

  return {
    update(time, dt, _exposure) {
      // 1. Floating blocks drift.
      handles.floaters.forEach((b, i) => {
        b.position.y = 1.55 + (i % 2) * 0.18 + Math.sin(time * 1.4 + i * 2.1) * 0.05;
        b.rotation.y = Math.sin(time * 0.8 + i) * 0.3;
      });

      // 2. Monitor blocks rearrange (redraw at <=12 fps).
      blockClock.t += dt;
      if (blockClock.t > 0.6) {
        blockClock.t = 0;
        const c = (handles.blockTex.image as HTMLCanvasElement).getContext('2d');
        if (c) {
          handles.drawBlocks(c, 512, 320, time);
          handles.blockTex.needsUpdate = true;
        }
      }

      // 3. Publish status lights pulse in turn.
      handles.lights.forEach((led, i) => {
        const mat = led.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = 0.5 + 0.5 * Math.max(0, Math.sin(time * 3 - i * 1.4));
      });

      // 4. Calendar dots tick.
      calClock.t += dt;
      if (calClock.t > 1.1) {
        calClock.t = 0;
        const c = (handles.calendarTex.image as HTMLCanvasElement).getContext('2d');
        if (c) {
          drawCalendar(c, 224, 160, time);
          handles.calendarTex.needsUpdate = true;
        }
      }
    },
    dispose() {
      // No per-instance GPU resources yet; T12 revisits disposal.
    },
  };
}
