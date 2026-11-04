/** @module scene/rooms/props/screen: canvas texture helpers for screens, gradients and drawn panels. @see src/scene/rooms/props/monitor.ts, src/scene/rooms/shell.ts */
import * as THREE from 'three';
import { PALETTE, lighten } from '@/config/palette';

export function makeCanvasTexture(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  draw(canvas.getContext('2d') as CanvasRenderingContext2D);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Simple linear gradient texture; direction 'to-right' or 'to-bottom'. */
export function makeGradientTexture(w: number, h: number, direction: 'to-right' | 'to-bottom'): THREE.CanvasTexture {
  return makeCanvasTexture(w, h, (ctx) => {
    const g = direction === 'to-right'
      ? ctx.createLinearGradient(0, 0, w, 0)
      : ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(61, 67, 57, 0.85)'); // ink with alpha
    g.addColorStop(1, 'rgba(61, 67, 57, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });
}

/** Code-editor style screen: dark ink panel with colored token lines. */
export function drawCodeScreen(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.fillStyle = PALETTE.graphite;
  ctx.fillRect(0, 0, w, h);
  const barH = h * 0.12;
  ctx.fillStyle = lighten(PALETTE.graphite, 0.15);
  ctx.fillRect(0, 0, w, barH);
  const colors = [PALETTE.butter, PALETTE.glow, PALETTE.sage, PALETTE.white];
  let y = barH + h * 0.07;
  for (let line = 0; y < h * 0.95; line++) {
    const indent = (line % 3) * w * 0.05;
    let cx = w * 0.06 + indent;
    const segs = 2 + ((line * 7) % 3);
    for (let s = 0; s < segs && cx < w * 0.9; s++) {
      const segW = w * (0.04 + ((line * 5 + s * 11) % 4) * 0.025);
      ctx.fillStyle = colors[(line + s) % colors.length];
      ctx.globalAlpha = 0.9;
      ctx.fillRect(cx, y, segW, h * 0.045);
      cx += segW + w * 0.02;
    }
    y += h * 0.11;
  }
  ctx.globalAlpha = 1;
}
