/** @module scene/rooms/props/duck: rubber duck that bobs (anim moves the group). @see src/scene/rooms/props/index.ts */
import * as THREE from 'three';
import { PALETTE } from '@/config/palette';
import type { PropFactory } from '@/config/types';

export const makeDuck: PropFactory = (ctx) => {
  const group = new THREE.Group();
  group.name = 'duck';
  const bodyMat = new THREE.MeshStandardMaterial({ color: PALETTE.glow, roughness: 0.5, metalness: 0 });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.05, 14, 12), bodyMat);
  body.scale.set(1.2, 0.9, 1);
  body.position.y = 0.045;
  body.castShadow = true;
  group.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.032, 12, 10), bodyMat);
  head.position.set(0.045, 0.1, 0);
  group.add(head);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.03, 8),
    new THREE.MeshStandardMaterial({ color: PALETTE.peach, roughness: 0.6, metalness: 0 }));
  beak.position.set(0.08, 0.095, 0);
  beak.rotation.z = -Math.PI / 2;
  group.add(beak);
  return group;
};
