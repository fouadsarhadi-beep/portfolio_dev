/** @module scene/rooms/props/desk: writing desk with drawer block and knob. @see src/scene/rooms/props/index.ts, docs/DESIGN.md (Prop quality rules) */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { PALETTE, darken, lighten } from '@/config/palette';
import type { PropFactory } from '@/config/types';

export const makeDesk: PropFactory = (ctx) => {
  const group = new THREE.Group();
  group.name = 'desk';

  const topMat = new THREE.MeshStandardMaterial({ color: lighten(PALETTE.wood, 0.12), roughness: 0.65, metalness: 0 });
  const legMat = ctx.mat.woodDark;
  const top = new THREE.Mesh(new RoundedBoxGeometry(1.9, 0.08, 0.9, 2, 0.03), topMat);
  top.position.y = 0.76;
  top.castShadow = true;
  top.receiveShadow = true;
  group.add(top);

  const legGeo = new THREE.BoxGeometry(0.08, 0.72, 0.08);
  for (const [x, z] of [[-0.86, -0.36], [0.86, -0.36], [-0.86, 0.36], [0.86, 0.36]] as const) {
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(x, 0.36, z);
    leg.castShadow = true;
    group.add(leg);
  }

  // Back modesty panel: the small detail that makes it read furniture.
  const panel = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.4, 0.04), legMat);
  panel.position.set(0, 0.42, -0.38);
  panel.castShadow = true;
  group.add(panel);

  // Drawer block with a knob.
  const drawer = new THREE.Mesh(new RoundedBoxGeometry(0.52, 0.26, 0.78, 2, 0.03), topMat);
  drawer.position.set(0.6, 0.59, 0);
  drawer.castShadow = true;
  group.add(drawer);
  const knob = new THREE.Mesh(
    new THREE.SphereGeometry(0.03, 12, 12),
    new THREE.MeshStandardMaterial({ color: darken(PALETTE.graphite, 0.1), roughness: 0.4, metalness: 0.2 }),
  );
  knob.position.set(0.6, 0.62, 0.4);
  group.add(knob);

  return group;
};
