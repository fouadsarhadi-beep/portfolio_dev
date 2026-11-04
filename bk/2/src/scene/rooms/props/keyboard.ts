/** @module scene/rooms/props/keyboard: desk keyboard with key rows and a space bar. @see src/scene/rooms/props/index.ts */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { PALETTE, lighten } from '@/config/palette';
import type { PropFactory } from '@/config/types';

export const makeKeyboard: PropFactory = (ctx) => {
  const group = new THREE.Group();
  group.name = 'keyboard';

  const base = new THREE.Mesh(
    new RoundedBoxGeometry(0.42, 0.03, 0.15, 1, 0.02),
    new THREE.MeshStandardMaterial({ color: lighten(PALETTE.graphite, 0.15), roughness: 0.5, metalness: 0.1 }),
  );
  base.position.y = 0.015;
  base.castShadow = true;
  group.add(base);

  const keyMat = new THREE.MeshStandardMaterial({ color: PALETTE.graphite, roughness: 0.6, metalness: 0 });
  const keyGeo = new THREE.BoxGeometry(0.028, 0.012, 0.028);
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 11; col++) {
      const key = new THREE.Mesh(keyGeo, keyMat);
      key.position.set(-0.18 + col * 0.034, 0.034, -0.045 + row * 0.04);
      group.add(key);
    }
  }
  const space = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.012, 0.028), keyMat);
  space.position.set(0, 0.034, 0.062);
  group.add(space);

  return group;
};
