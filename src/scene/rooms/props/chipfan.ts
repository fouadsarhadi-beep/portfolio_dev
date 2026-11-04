/** @module scene/rooms/props/chipfan: fanned color-chip deck (pivot name: fanPivot). @see src/scene/rooms/props/index.ts */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { PALETTE } from '@/config/palette';
import type { PropFactory } from '@/config/types';

const CHIP_COLORS = [PALETTE.rose, PALETTE.butter, PALETTE.blue, PALETTE.sage, PALETTE.peach, PALETTE.lilac];

export const makeChipFan: PropFactory = (ctx) => {
  const group = new THREE.Group();
  group.name = 'chipFan';
  const pivot = new THREE.Group();
  pivot.name = 'fanPivot';
  const chipGeo = new RoundedBoxGeometry(0.22, 0.05, 0.05, 1, 0.02);
  for (let i = 0; i < 6; i++) {
    const chip = new THREE.Mesh(chipGeo, new THREE.MeshStandardMaterial({ color: CHIP_COLORS[i], roughness: 0.7, metalness: 0 }));
    chip.position.set(0.14, 0, 0);
    const arm = new THREE.Group();
    arm.rotation.y = (i - 2.5) * 0.18;
    arm.add(chip);
    pivot.add(arm);
  }
  group.add(pivot);
  return group;
};
