/** @module scene/rooms/props/tokenrack: wall rack of design-token swatches. @see src/scene/rooms/props/index.ts */
import * as THREE from 'three';
import { PALETTE, lighten } from '@/config/palette';
import type { PropFactory } from '@/config/types';

export const makeTokenRack: PropFactory = (ctx) => {
  const group = new THREE.Group();
  group.name = 'tokenRack';
  group.rotation.y = Math.PI / 2;
  group.add(new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.26, 0.03), ctx.mat.woodDark));
  const chipGeo = new THREE.BoxGeometry(0.1, 0.18, 0.04);
  [PALETTE.blue, lighten(PALETTE.blue, 0.3), PALETTE.white, PALETTE.graphite].forEach((col, i) => {
    const chip = new THREE.Mesh(chipGeo, new THREE.MeshStandardMaterial({ color: col, roughness: 0.6, metalness: 0 }));
    chip.position.set(-0.21 + i * 0.14, 0, 0.03);
    group.add(chip);
  });
  return group;
};
