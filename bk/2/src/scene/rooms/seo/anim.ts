/** @module scene/rooms/seo/anim: canvas draws and idle loops of the analytics room. @see docs/ROOMS.md (3 seo), docs/MOTION.md (Idle animation) */
import * as THREE from 'three';
import { PALETTE, lighten } from '@/config/palette';
import type { SeoHandles } from './layout';

/** Dashboard wall: bar chart with changing heights and a line chart with a scan line. */
export function drawDash(c: CanvasRenderingContext2D, w: number, h: number, t: number): void {
  c.fillStyle = PALETTE.white;
  c.fillRect(0, 0, w, h);
  for (let i = 0; i < 9; i++) {
    const bh = h * (0.2 + 0.5 * Math.abs(Math.sin(t * 0.9 + i * 1.7)));
    c.fillStyle = i % 2 === 0 ? PALETTE.peach : lighten(PALETTE.peach, 0.25);
    c.fillRect(w * 0.06 + i * (w * 0.09), h - bh - 8, w * 0.06, bh);
  }
  c.strokeStyle = PALETTE.graphite;
  c.lineWidth = 3;
  c.beginPath();
  for (let x = 0; x <= w * 0.42; x += 4) {
    const y = h * 0.5 - Math.sin(x * 0.02 + t) * h * 0.12 - h * 0.18;
    if (x === 0) c.moveTo(w * 0.5 + x, y);
    else c.lineTo(w * 0.5 + x, y);
  }
  c.stroke();
  const scan = ((t * 0.35) % 1) * w * 0.42;
  c.fillStyle = PALETTE.glow;
  c.globalAlpha = 0.55;
  c.fillRect(w * 0.5 + scan, h * 0.12, 5, h * 0.68);
  c.globalAlpha = 1;
}

/** Four metric tiles whose numbers tick up. */
export function drawMetrics(c: CanvasRenderingContext2D, w: number, h: number, t: number): void {
  c.fillStyle = PALETTE.white;
  c.fillRect(0, 0, w, h);
  const base = [1.2, 38, 96, 512];
  for (let i = 0; i < 4; i++) {
    const x = (i % 2) * (w / 2);
    const y = Math.floor(i / 2) * (h / 2);
    c.fillStyle = i % 2 === 0 ? lighten(PALETTE.peach, 0.55) : PALETTE.white;
    c.fillRect(x + 4, y + 4, w / 2 - 8, h / 2 - 8);
    c.fillStyle = PALETTE.ink;
    c.font = `600 ${h * 0.16}px 'DM Sans Variable', sans-serif`;
    c.fillText(String(base[i] + Math.floor((t * (i + 3)) % 40)), x + w * 0.1, y + h * 0.34);
    c.fillStyle = PALETTE.inkSoft;
    c.fillRect(x + w * 0.1, y + h * 0.44, w * 0.22, 4);
  }
}

export interface Anim {
  update(time: number, dt: number, exposure: number): void;
  dispose(): void;
}

export function createAnim(room: THREE.Group, handles: SeoHandles): Anim {
  const dashClock = { t: 0 };
  const metricClock = { t: 0 };
  const glint = handles.glint;

  function redraw(tex: THREE.CanvasTexture, w: number, h: number, draw: (c: CanvasRenderingContext2D, w: number, h: number, t: number) => void, t: number): void {
    const c = (tex.image as HTMLCanvasElement).getContext('2d');
    if (!c) return;
    draw(c, w, h, t);
    tex.needsUpdate = true;
  }

  return {
    update(time, dt, _exposure) {
      // 1. Bars change height + 2. scan line sweeps: dashboard redraws at <=12 fps.
      dashClock.t += dt;
      if (dashClock.t > 0.45) {
        redraw(handles.dashTex, 512, 256, handles.drawDash, time);
        dashClock.t = 0;
      }
      // 3. Metric numbers tick up.
      metricClock.t += dt;
      if (metricClock.t > 0.9) {
        redraw(handles.metricTex, 256, 128, handles.drawMetrics, time);
        metricClock.t = 0;
      }
      // 4. A glint sweeps the magnifier glass (orbit in the ring plane).
      if (glint) {
        const a = time * 2.2;
        glint.position.set(Math.cos(a) * 0.1, 0.75 + Math.sin(a) * 0.1 * 0.35, Math.sin(a) * 0.09);
      }
    },
    dispose() {
      // No per-instance GPU resources yet; T12 revisits disposal.
    },
  };
}
