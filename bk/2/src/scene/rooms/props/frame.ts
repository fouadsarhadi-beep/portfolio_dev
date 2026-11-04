/** @module scene/rooms/props/frame: wall frame with a drawn canvas (opts: draw, w, h). @see src/scene/rooms/props/screen.ts, src/scene/rooms/props/index.ts */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { PALETTE, lighten } from '@/config/palette';
import type { PropFactory } from '@/config/types';
import { makeCanvasTexture } from './screen';

export const makeWallFrame: PropFactory = (ctx, opts) => {
  const group = new THREE.Group();
  group.name = 'wallFrame';
  const w = typeof opts?.w === 'number' ? opts.w : 0.55;
  const h = typeof opts?.h === 'number' ? opts.h : 0.4;
  const draw = opts?.draw as ((c: CanvasRenderingContext2D, w: number, h: number) => void) | undefined;

  const frame = new THREE.Mesh(new RoundedBoxGeometry(w, h, 0.035, 1, 0.02), ctx.mat.woodDark);
  frame.castShadow = true;
  group.add(frame);

  const tex = makeCanvasTexture(256, Math.round((256 * h) / w), (c) =>
    (draw ?? defaultDrawing)(c, 256, Math.round((256 * h) / w)),
  );
  const canvas = new THREE.Mesh(
    new THREE.PlaneGeometry(w - 0.08, h - 0.08),
    new THREE.MeshBasicMaterial({ map: tex }),
  );
  canvas.position.z = 0.02;
  group.add(canvas);

  return group;
};

/** Default: three soft landscape bands. */
function defaultDrawing(c: CanvasRenderingContext2D, w: number, h: number): void {
  c.fillStyle = lighten(PALETTE.bg, 0.2);
  c.fillRect(0, 0, w, h);
  c.fillStyle = PALETTE.glow;
  c.fillRect(0, 0, w, h * 0.45);
  c.fillStyle = lighten(PALETTE.sage, 0.2);
  c.beginPath();
  c.moveTo(0, h);
  c.lineTo(w * 0.35, h * 0.5);
  c.lineTo(w * 0.65, h);
  c.closePath();
  c.fill();
  c.fillStyle = PALETTE.sage;
  c.beginPath();
  c.moveTo(w * 0.5, h);
  c.lineTo(w * 0.8, h * 0.6);
  c.lineTo(w, h);
  c.closePath();
  c.fill();
}
