/** @module scene/rooms/props/papers: stack of paper sheets; the top sheet animates (name: topSheet). @see src/scene/rooms/props/index.ts */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import type { PropFactory } from '@/config/types';

export const makePapers: PropFactory = (ctx, opts) => {
  const group = new THREE.Group();
  group.name = 'papers';
  const count = typeof opts?.count === 'number' ? opts.count : 7;
  const w = 0.3;
  const d = 0.42;

  const sheetGeo = new RoundedBoxGeometry(w, 0.014, d, 1, 0.02);
  const sheetMat = ctx.mat.white;
  for (let i = 0; i < count; i++) {
    const sheet = new THREE.Mesh(sheetGeo, sheetMat);
    const top = i === count - 1;
    sheet.position.y = 0.008 + i * 0.014;
    sheet.rotation.y = (i * 0.35) % Math.PI;
    if (top) sheet.name = 'topSheet';
    sheet.castShadow = true;
    sheet.receiveShadow = true;
    group.add(sheet);
  }

  return group;
};
