/** @module scene/rooms/props/easel: floor easel holding a painted canvas (opts: tex). @see src/scene/rooms/props/index.ts */
import * as THREE from 'three';
import { PALETTE } from '@/config/palette';
import type { PropFactory } from '@/config/types';

export const makeEasel: PropFactory = (ctx, opts) => {
  const group = new THREE.Group();
  group.name = 'easel';
  const legGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.1, 8);
  for (const side of [-1, 1]) {
    const leg = new THREE.Mesh(legGeo, ctx.mat.woodDark);
    leg.position.set(side * 0.22, 0.55, 0.06);
    leg.rotation.z = side * 0.12;
    leg.castShadow = true;
    group.add(leg);
  }
  const backLeg = new THREE.Mesh(legGeo, ctx.mat.woodDark);
  backLeg.position.set(0, 0.55, -0.18);
  backLeg.rotation.x = 0.2;
  group.add(backLeg);
  const tray = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.03, 0.08), ctx.mat.woodDark);
  tray.position.set(0, 0.55, 0.14);
  group.add(tray);
  const canvas = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.52, 0.02),
    new THREE.MeshStandardMaterial({ color: PALETTE.white, roughness: 0.9, metalness: 0 }));
  canvas.position.set(0, 0.88, 0.02);
  canvas.rotation.x = -0.08;
  canvas.castShadow = true;
  group.add(canvas);
  const tex = opts?.tex as THREE.CanvasTexture | undefined;
  if (tex) {
    const face = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.46), new THREE.MeshBasicMaterial({ map: tex }));
    face.position.set(0, 0.88, 0.036);
    face.rotation.x = -0.08;
    group.add(face);
  }
  return group;
};
