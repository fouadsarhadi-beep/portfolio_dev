/** @module scene/rooms/props/rug: flat round rug with a border ring. @see src/scene/rooms/props/index.ts */
import * as THREE from 'three';
import { PALETTE, lighten } from '@/config/palette';
import type { PropFactory } from '@/config/types';

export const makeRug: PropFactory = (ctx, opts) => {
  const group = new THREE.Group();
  group.name = 'rug';
  const color = typeof opts?.color === 'string' ? opts.color : '';
  const r = typeof opts?.radius === 'number' ? opts.radius : 1.05;

  const main = new THREE.Mesh(
    new THREE.CylinderGeometry(r, r, 0.02, 40),
    new THREE.MeshStandardMaterial({
      color: color ? new THREE.Color(color) : lighten(PALETTE.butter, 0.35),
      roughness: 0.95,
      metalness: 0,
    }),
  );
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
