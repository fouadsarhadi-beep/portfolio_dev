/** @module scene/rooms/web-design-development/anim: idle loops of the merged workspace. @see docs/ROOMS.md (4), docs/MOTION.md (Idle animation) */
import * as THREE from 'three';
import type { WddHandles } from './layout';
import { PALETTE, lighten, darken } from '@/config/palette';

/** Code editor whose code types itself (rose-on-graphite to match the room). */
export function drawEditor(c: CanvasRenderingContext2D, w: number, h: number, t: number): void {
  c.fillStyle = PALETTE.graphite;
  c.fillRect(0, 0, w, h);
  const lines = ['const system = design();', 'build(system.pages);', 'ship(accessible);', 'render(scene, cam);'];
  let shown = Math.floor((t * 0.6) % 32);
  c.font = "600 16px 'DM Sans Variable', monospace";
  lines.forEach((line, i) => {
    const take = Math.max(0, Math.min(line.length, shown));
    shown -= line.length + 2;
    if (take > 0) {
      c.fillStyle = i % 2 === 0 ? PALETTE.glow : PALETTE.rose;
      c.fillText(line.slice(0, take), 16, 40 + i * 34);
    }
  });
  if (Math.floor(t * 2) % 2 === 0) {
    c.fillStyle = PALETTE.white;
    c.fillRect(16, 150, 12, 18);
  }
}

/** Browser preview pane with a rose-tinted hero block. */
export function drawBrowser(c: CanvasRenderingContext2D, w: number, h: number): void {
  c.fillStyle = PALETTE.white;
  c.fillRect(0, 0, w, h);
  c.fillStyle = lighten(PALETTE.graphite, 0.2);
  c.fillRect(0, 0, w, h * 0.12);
  c.fillStyle = PALETTE.rose;
  c.fillRect(w * 0.06, h * 0.2, w * 0.4, h * 0.1);
  c.fillStyle = PALETTE.inkSoft;
  c.fillRect(w * 0.06, h * 0.36, w * 0.88, h * 0.05);
  c.fillRect(w * 0.06, h * 0.46, w * 0.7, h * 0.05);
  c.fillStyle = PALETTE.sage;
  c.fillRect(w * 0.06, h * 0.6, w * 0.3, h * 0.18);
  c.fillStyle = PALETTE.butter;
  c.fillRect(w * 0.42, h * 0.6, w * 0.3, h * 0.18);
}

/** A stroke draws itself across the easel canvas. */
export function drawStroke(c: CanvasRenderingContext2D, w: number, h: number, t: number): void {
  c.fillStyle = PALETTE.white;
  c.fillRect(0, 0, w, h);
  c.strokeStyle = darken(PALETTE.rose, 0.25);
  c.lineWidth = 8;
  c.strokeRect(6, 6, w - 12, h - 12);
  c.strokeStyle = PALETTE.rose;
  c.lineWidth = 10;
  c.lineCap = 'round';
  c.beginPath();
  const p = (t * 0.25) % 1.2;
  const pts: Array<[number, number]> = [[40, 180], [80, 90], [128, 150], [176, 70], [216, 140]];
  c.moveTo(pts[0][0], pts[0][1]);
  let budget = p * 520;
  for (let i = 1; i < pts.length && budget > 0; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const seg = Math.hypot(x1 - x0, y1 - y0);
    const f = Math.min(1, budget / seg);
    c.lineTo(x0 + (x1 - x0) * f, y0 + (y1 - y0) * f);
    budget -= seg;
  }
  c.stroke();
}

export interface Anim {
  update(time: number, dt: number, exposure: number): void;
  dispose(): void;
}

export function createAnim(room: THREE.Group, handles: WddHandles): Anim {
  const editorClock = { t: 0 };
  const easelClock = { t: 0 };
  const ledColors = [PALETTE.blue, PALETTE.glow, PALETTE.rose];
  let ledIndex = 0;
  let ledClock = 0;
  const swatches = [0, 1, 2, 3, 4, 5]
    .map((i) => room.getObjectByName(`swatch-${i}`))
    .filter((s): s is THREE.Mesh => Boolean(s));
  const gaugeNeedle = room.getObjectByName('needle');

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

      // 2. A stroke draws itself on the easel canvas (<=12 fps).
      easelClock.t += dt;
      if (easelClock.t > 0.4) {
        easelClock.t = 0;
        const c = (handles.easelTex.image as HTMLCanvasElement).getContext('2d');
        if (c) {
          handles.drawStroke(c, 256, 256, time);
          handles.easelTex.needsUpdate = true;
        }
      }

      // 3. Swatches highlight in turn.
      swatches.forEach((sw, i) => {
        const mat = sw.material as THREE.MeshStandardMaterial;
        const phase = Math.sin(time * 2.4 - i * 0.9);
        mat.emissive.set(mat.color);
        mat.emissiveIntensity = phase > 0.86 ? 0.45 : 0;
      });

      // 4. The gauge needle sweeps.
      if (gaugeNeedle) {
        gaugeNeedle.rotation.z = -0.7 + Math.sin(time * 0.9) * 0.9;
      }

      // 5. The LED strip shifts color.
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

      // 6. The duck bobs.
      if (handles.duck) {
        handles.duck.position.y = 0.815 + Math.sin(time * 2.6) * 0.008;
        handles.duck.rotation.y = Math.sin(time * 1.3) * 0.2;
      }
    },
    dispose() {
      // No per-instance GPU resources yet; revisit on disposal pass.
    },
  };
}
