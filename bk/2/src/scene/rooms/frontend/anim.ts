/** @module scene/rooms/frontend/anim: idle loops of the development workspace. @see docs/ROOMS.md (5 frontend), docs/MOTION.md (Idle animation) */
import * as THREE from 'three';
import { PALETTE, lighten } from '@/config/palette';
import { drawEditor, type FrontendHandles } from './layout';

export interface Anim {
  update(time: number, dt: number, exposure: number): void;
  dispose(): void;
}

export function createAnim(handles: FrontendHandles): Anim {
  const editorClock = { t: 0 };
  const ledColors = [PALETTE.glow, PALETTE.blue, lighten(PALETTE.blue, 0.35)];
  let ledIndex = 0;
  let ledClock = 0;

  return {
    update(time, dt, _exposure) {
      // 1. The code types itself (redraw at <=12 fps).
      editorClock.t += dt;
      if (editorClock.t > 0.35) {
        editorClock.t = 0;
        const c = (handles.editorTex.image as HTMLCanvasElement).getContext('2d');
        if (c) {
          handles.drawEditor(c, 512, 320, time);
          handles.editorTex.needsUpdate = true;
        }
      }

      // 2. Component cards snap into the grid, one after another.
      handles.cards.forEach((card, i) => {
        const phase = Math.max(0, Math.sin(time * 1.8 - i * 0.55));
        const s = 0.92 + phase * 0.12;
        card.scale.set(s, s, s);
      });

      // 3. The gauge needle sweeps.
      if (handles.gaugeNeedle) {
        handles.gaugeNeedle.rotation.z = -0.7 + Math.sin(time * 0.9) * 0.9;
      }

      // 4. The LED strip shifts color.
      ledClock += dt;
      if (ledClock > 1.4) {
        ledClock = 0;
        ledIndex = (ledIndex + 1) % ledColors.length;
        const mat = handles.ledStrip?.material as THREE.MeshStandardMaterial | undefined;
        if (mat) {
          mat.color.set(ledColors[ledIndex]);
          mat.emissive.set(ledColors[ledIndex]);
        }
      }

      // 5. The duck bobs.
      if (handles.duck) {
        handles.duck.position.y = 0.815 + Math.sin(time * 2.6) * 0.008;
        handles.duck.rotation.y = Math.sin(time * 1.3) * 0.2;
      }
    },
    dispose() {
      // No per-instance GPU resources yet; T12 revisits disposal.
    },
  };
}
