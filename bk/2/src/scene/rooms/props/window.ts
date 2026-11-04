/** @module scene/rooms/props/window: wall window with cross bars and soft glow glass. @see src/scene/rooms/props/index.ts */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { PALETTE } from '@/config/palette';
import type { PropFactory } from '@/config/types';

export const makeWindow: PropFactory = (ctx) => {
  const group = new THREE.Group();
  group.name = 'window';

  const frame = new THREE.Mesh(new RoundedBoxGeometry(0.7, 0.9, 0.07, 1, 0.03), ctx.mat.white);
  frame.castShadow = true;
  group.add(frame);

  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(0.56, 0.76),
    new THREE.MeshStandardMaterial({
      color: PALETTE.glow,
      roughness: 0.25,
      metalness: 0,
      emissive: PALETTE.glow,
      emissiveIntensity: 0.35,
    }),
  );
  glass.position.z = 0.02;
  group.add(glass);

  const barMat = ctx.mat.white;
  const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.76, 0.02), barMat);
  vBar.position.z = 0.028;
  group.add(vBar);
  const hBar = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.03, 0.02), barMat);
  hBar.position.z = 0.028;
  group.add(hBar);

  return group;
};
