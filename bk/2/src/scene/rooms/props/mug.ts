/** @module scene/rooms/props/mug: mug with handle and three steam puffs. @see src/scene/rooms/props/index.ts */
import * as THREE from 'three';
import { PALETTE } from '@/config/palette';
import type { PropFactory } from '@/config/types';

export const makeMug: PropFactory = (ctx) => {
  const group = new THREE.Group();
  group.name = 'mug';

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.05, 0.11, 18),
    ctx.mat.white,
  );
  body.position.y = 0.055;
  body.castShadow = true;
  group.add(body);

  // Coffee surface: the small detail.
  const coffee = new THREE.Mesh(
    new THREE.CylinderGeometry(0.048, 0.048, 0.01, 18),
    new THREE.MeshStandardMaterial({ color: PALETTE.graphite, roughness: 0.35, metalness: 0 }),
  );
  coffee.position.y = 0.105;
  group.add(coffee);

  const handle = new THREE.Mesh(
    new THREE.TorusGeometry(0.035, 0.011, 8, 14, Math.PI),
    ctx.mat.white,
  );
  handle.position.set(0.055, 0.06, 0);
  handle.rotation.z = -Math.PI / 2;
  handle.castShadow = true;
  group.add(handle);

  // Steam puffs: three soft spheres drifting above.
  const steamMat = new THREE.MeshBasicMaterial({ color: PALETTE.white, transparent: true, opacity: 0.35 });
  for (let i = 0; i < 3; i++) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.014 + i * 0.004, 8, 8), steamMat);
    puff.name = `steam-${i}`;
    puff.position.set((i - 1) * 0.012, 0.15 + i * 0.045, 0);
    group.add(puff);
  }

  return group;
};
