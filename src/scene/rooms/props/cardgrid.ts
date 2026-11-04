/** @module scene/rooms/props/cardgrid: wall grid of component cards (names: card-0..5). @see src/scene/rooms/props/index.ts */
import * as THREE from 'three';
import { PALETTE, lighten } from '@/config/palette';
import type { PropFactory } from '@/config/types';

export const makeCardGrid: PropFactory = (ctx) => {
  const group = new THREE.Group();
  group.name = 'cardGrid';
  const cardGeo = new THREE.PlaneGeometry(0.26, 0.16);
  for (let i = 0; i < 6; i++) {
    const cardCol = i % 2 === 0 ? PALETTE.white : lighten(PALETTE.blue, 0.45);
    const card = new THREE.Mesh(cardGeo, new THREE.MeshStandardMaterial({ color: cardCol, roughness: 0.9, metalness: 0, side: THREE.DoubleSide }));
    card.position.set(-0.42 + (i % 3) * 0.42, i < 3 ? 0.22 : -0.02, 0);
    card.name = `card-${i}`;
    group.add(card);
  }
  return group;
};
