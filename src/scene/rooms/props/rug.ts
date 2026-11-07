/** @module scene/rooms/props/rug: flat round rug with a border ring and, optionally, the floor's skill glyph woven into it. @see src/scene/rooms/props/index.ts, src/scene/rooms/props/screen.ts */
import * as THREE from 'three';
import { PALETTE, lighten, darken } from '@/config/palette';
import type { PropFactory } from '@/config/types';
import { makeCanvasTexture } from './screen';

/** 24x24 viewBox icon path, centred and inset on a square canvas filled with `fill`. */
function glyphTexture(path: string, fill: string, ink: string): THREE.CanvasTexture {
  return makeCanvasTexture(256, 256, (c) => {
    c.fillStyle = fill;
    c.fillRect(0, 0, 256, 256);
    const k = 256 / 32; // the icon fills most of the rug, so it reads from the overview
    c.save();
    c.translate(128, 128);
    c.scale(k, k);
    c.translate(-12, -12);
    c.fillStyle = ink;
    c.fill(new Path2D(path));
    c.restore();
  });
}

export const makeRug: PropFactory = (ctx, opts) => {
  const group = new THREE.Group();
  group.name = 'rug';
  const color = typeof opts?.color === 'string' ? opts.color : '';
  const r = typeof opts?.radius === 'number' ? opts.radius : 1.05;
  const glyph = typeof opts?.glyph === 'string' ? opts.glyph : '';

  const base = new THREE.Color(color || lighten(PALETTE.butter, 0.35));
  const hex = `#${base.getHexString()}`;
  const plain = () =>
    new THREE.MeshStandardMaterial({ color: base, roughness: 0.95, metalness: 0 });
  // The top cap carries the glyph; the side and the underside keep the plain rug.
  const top = glyph
    ? new THREE.MeshStandardMaterial({
        map: glyphTexture(glyph, hex, darken(hex, 0.32)),
        roughness: 0.95,
        metalness: 0,
      })
    : plain();

  const main = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.02, 40), [plain(), top, plain()]);
  main.position.y = 0.042;
  main.receiveShadow = true;
  group.add(main);

  const border = new THREE.Mesh(
    new THREE.CylinderGeometry(r + 0.05, r + 0.05, 0.016, 40),
    new THREE.MeshStandardMaterial({
      color: lighten(PALETTE.butter, 0.6),
      roughness: 0.95,
      metalness: 0,
    }),
  );
  border.position.y = 0.038;
  border.receiveShadow = true;
  group.add(border);

  return group;
};
