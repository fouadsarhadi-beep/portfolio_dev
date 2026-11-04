/** @module scene/rooms/props/chair: small studio chair, seat, backrest and four legs. @see src/scene/rooms/props/index.ts */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import type { PropFactory } from '@/config/types';

export const makeChair: PropFactory = (ctx) => {
  const group = new THREE.Group();
  group.name = 'chair';

  const seatMat = ctx.mat.white;
  const legMat = ctx.mat.graphite;

  const seat = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.07, 0.48, 2, 0.03), seatMat);
  seat.position.y = 0.44;
  seat.castShadow = true;
  group.add(seat);

  const back = new THREE.Mesh(new RoundedBoxGeometry(0.48, 0.52, 0.06, 2, 0.03), seatMat);
  back.position.set(0, 0.72, -0.21);
  back.rotation.x = -0.08;
  back.castShadow = true;
  group.add(back);

  const legGeo = new THREE.BoxGeometry(0.05, 0.42, 0.05);
  for (const [x, z] of [[-0.2, -0.18], [0.2, -0.18], [-0.2, 0.18], [0.2, 0.18]] as const) {
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(x, 0.21, z);
    leg.castShadow = true;
    group.add(leg);
  }

  return group;
};
