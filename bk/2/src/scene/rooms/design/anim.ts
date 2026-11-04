/** @module scene/rooms/design/anim: idle loops of the design studio. @see docs/ROOMS.md (4 design), docs/MOTION.md (Idle animation) */
import * as THREE from 'three';
import { drawStroke, drawGlyph, type DesignHandles } from './layout';

export interface Anim {
  update(time: number, dt: number, exposure: number): void;
  dispose(): void;
}

export function createAnim(handles: DesignHandles): Anim {
  const easelClock = { t: 0 };
  const glyphClock = { t: 0 };

  return {
    update(time, dt, _exposure) {
      // 1. Swatches highlight in turn (emissive pulse traveling through the row).
      handles.swatches.forEach((sw, i) => {
        const mat = sw.material as THREE.MeshStandardMaterial;
        const phase = Math.sin(time * 2.4 - i * 0.9);
        mat.emissive.set(mat.color);
        mat.emissiveIntensity = phase > 0.86 ? 0.45 : 0;
      });

      // 2. A stroke draws itself on the easel canvas (redraw at <=12 fps).
      easelClock.t += dt;
      if (easelClock.t > 0.4) {
        easelClock.t = 0;
        const c = (handles.easelTex.image as HTMLCanvasElement).getContext('2d');
        if (c) {
          drawStroke(c, 256, 256, time);
          handles.easelTex.needsUpdate = true;
        }
      }

      // 3. The poster glyph swaps.
      glyphClock.t += dt;
      if (glyphClock.t > 1.2) {
        glyphClock.t = 0;
        const c = (handles.posterTex.image as HTMLCanvasElement).getContext('2d');
        if (c) {
          drawGlyph(c, 160, 200, time);
          handles.posterTex.needsUpdate = true;
        }
      }

      // 4. The chip fan opens and closes slowly.
      if (handles.fanPivot) {
        handles.fanPivot.rotation.y = Math.sin(time * 0.7) * 0.35;
      }
    },
    dispose() {
      // No per-instance GPU resources yet; T12 revisits disposal.
    },
  };
}
