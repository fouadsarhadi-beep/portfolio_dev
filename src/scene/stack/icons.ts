/** @module scene/stack/icons: draws layer icons, numbers and registration crosses to CanvasTextures. @see docs/DESIGN.md (Slab), src/scene/stack/slab.ts */
import * as THREE from 'three';
import { PALETTE } from '@/config/palette';

function toTexture(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

/** Draws the layer icon SVG path (24x24 viewBox) filled with `color`. */
export function makeIconTexture(path: string, color: string, size = 128): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  ctx.save();
  ctx.scale(size / 24, size / 24);
  ctx.fillStyle = color;
  ctx.fill(new Path2D(path));
  ctx.restore();
  return toTexture(canvas);
}

interface FaceColors {
  main: string;
  highlight: string;
  cross: string;
}

const FONT = "'Fredoka Variable', 'DM Sans Variable', system-ui, sans-serif";

/** Number + registration crosses for the whole +z face (w x h world units). */
export function makeNumberTexture(
  number: string,
  w: number,
  h: number,
  colors: FaceColors,
  pxPerUnit = 160,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w * pxPerUnit);
  canvas.height = Math.round(h * pxPerUnit);
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

  drawCross(ctx, 34, 34);
  drawCross(ctx, canvas.width - 34, canvas.height - 34);

  const size = canvas.height * 0.62;
  ctx.font = `600 ${size}px ${FONT}`;
  ctx.textBaseline = 'middle';
  const x = canvas.height * 0.42;
  const y = canvas.height / 2 + size * 0.12;
  ctx.fillStyle = colors.highlight;
  ctx.fillText(number, x + 3, y + 5);
  ctx.fillStyle = colors.main;
  ctx.fillText(number, x, y);

  return toTexture(canvas);
}

/** Small print-style registration cross, used in two corners of the left face. */
function drawCross(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  const arm = 13;
  ctx.strokeStyle = PALETTE.graphite;
  ctx.globalAlpha = 0.65;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - arm, cy);
  ctx.lineTo(cx + arm, cy);
  ctx.moveTo(cx, cy - arm);
  ctx.lineTo(cx, cy + arm);
  ctx.stroke();
  ctx.globalAlpha = 1;
}
