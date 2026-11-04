/** @module scene/rooms/props/lamp: floor lamp with a pulsing warm glow (names: lampShade, lampLight). @see src/scene/rooms/props/index.ts */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { PALETTE } from '@/config/palette';
import type { PropFactory } from '@/config/types';

export const makeLamp: PropFactory = (ctx) => {
  const group = new THREE.Group();
  group.name = 'lamp';

  const metal = new THREE.MeshStandardMaterial({ color: PALETTE.graphite, roughness: 0.45, metalness: 0.3 });

  const base = new THREE.Mesh(new RoundedBoxGeometry(0.3, 0.05, 0.3, 2, 0.03), metal);
  base.position.y = 0.025;
  base.castShadow = true;
  group.add(base);

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 1.34, 10), metal);
  pole.position.y = 0.72;
  pole.castShadow = true;
  group.add(pole);

  const shade = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.2, 0.24, 20, 1, true),
    new THREE.MeshStandardMaterial({
      color: PALETTE.white,
      roughness: 0.6,
      metalness: 0,
      side: THREE.DoubleSide,
      emissive: PALETTE.ledAmber,
      emissiveIntensity: 0.55,
    }),
  );
  shade.name = 'lampShade';
  shade.position.y = 1.46;
  group.add(shade);

  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 10, 10),
    new THREE.MeshStandardMaterial({ color: PALETTE.white, emissive: PALETTE.ledAmber, emissiveIntensity: 0.9 }),
  );
  bulb.position.y = 1.44;
  group.add(bulb);

  const light = new THREE.PointLight(PALETTE.ledAmber, 0.5, 3.2, 2);
  light.name = 'lampLight';
  light.position.y = 1.42;
  group.add(light);

  return group;
};
