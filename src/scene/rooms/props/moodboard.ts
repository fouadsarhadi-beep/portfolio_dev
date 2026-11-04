/** @module scene/rooms/props/moodboard: wall mood board with swatches (names: swatch-0..5). @see src/scene/rooms/props/index.ts */
import * as THREE from 'three';
import { PALETTE } from '@/config/palette';
import type { PropFactory } from '@/config/types';

const SWATCH_COLORS = [PALETTE.rose, PALETTE.butter, PALETTE.blue, PALETTE.sage, PALETTE.peach, PALETTE.lilac];

export const makeMoodBoard: PropFactory = (ctx) => {
  const group = new THREE.Group();
  group.name = 'moodBoard';
  group.add(new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.6, 0.02), ctx.mat.woodDark));
  const swatchGeo = new THREE.PlaneGeometry(0.18, 0.18);
  for (let i = 0; i < 6; i++) {
    const sw = new THREE.Mesh(swatchGeo, new THREE.MeshStandardMaterial({ color: SWATCH_COLORS[i], roughness: 0.8, metalness: 0 }));
    sw.position.set(-0.32 + (i % 3) * 0.32, i < 3 ? 0.12 : -0.14, 0.02);
    sw.name = `swatch-${i}`;
    group.add(sw);
  }
  return group;
};
