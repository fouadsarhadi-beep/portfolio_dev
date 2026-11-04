/** @module scene/rooms/props/gauge: wall gauge with an animated needle (name: needle). @see src/scene/rooms/props/index.ts */
import * as THREE from 'three';
import { PALETTE } from '@/config/palette';
import type { PropFactory } from '@/config/types';

export const makeGauge: PropFactory = (ctx) => {
  const group = new THREE.Group();
  group.name = 'gauge';
  const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.03, 24),
    new THREE.MeshStandardMaterial({ color: PALETTE.white, roughness: 0.7, metalness: 0 }));
  dial.rotation.x = Math.PI / 2;
  group.add(dial);
  group.add(new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.015, 8, 28), ctx.mat.graphite));
  const needle = new THREE.Group();
  needle.name = 'needle';
  const stick = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.15, 0.012), new THREE.MeshBasicMaterial({ color: PALETTE.graphite }));
  stick.position.y = 0.07;
  needle.add(stick);
  needle.position.z = 0.03;
  group.add(needle);
  return group;
};
