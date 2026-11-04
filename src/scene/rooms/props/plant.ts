/** @module scene/rooms/props/plant: potted plant with instanced leaves that sway (name: leaves). @see src/scene/rooms/props/index.ts, docs/DESIGN.md (Prop quality rules) */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { PALETTE, lighten } from '@/config/palette';
import type { PropFactory } from '@/config/types';

export const makePlant: PropFactory = (ctx) => {
  const group = new THREE.Group();
  group.name = 'plant';

  const pot = new THREE.Mesh(
    new RoundedBoxGeometry(0.26, 0.22, 0.26, 2, 0.04),
    new THREE.MeshStandardMaterial({ color: lighten(PALETTE.wood, 0.05), roughness: 0.85, metalness: 0 }),
  );
  pot.position.y = 0.11;
  pot.castShadow = true;
  pot.receiveShadow = true;
  group.add(pot);

  // Soil disc: the small secondary detail.
  const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 16), ctx.mat.woodDark);
  soil.position.y = 0.225;
  group.add(soil);

  const leaves = new THREE.Group();
  leaves.name = 'leaves';
  const leafGeo = new THREE.ConeGeometry(0.05, 0.28, 6);
  const leafMat = new THREE.MeshStandardMaterial({ color: PALETTE.sage, roughness: 0.7, metalness: 0 });
  const count = 9;
  const mesh = new THREE.InstancedMesh(leafGeo, leafMat, count);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const s = new THREE.Vector3();
  const pos = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const r = 0.02 + (i % 3) * 0.035;
    pos.set(Math.cos(a) * r, 0.34 + (i % 3) * 0.075, Math.sin(a) * r);
    e.set((i % 2 ? 0.35 : -0.35), a, (i % 3) * 0.12);
    q.setFromEuler(e);
    s.setScalar(0.8 + (i % 4) * 0.1);
    m.compose(pos, q, s);
    mesh.setMatrixAt(i, m);
    mesh.setColorAt(i, new THREE.Color(i % 3 === 0 ? lighten(PALETTE.sage, 0.15) : PALETTE.sage));
  }
  mesh.castShadow = true;
  leaves.add(mesh);
  group.add(leaves);

  return group;
};
