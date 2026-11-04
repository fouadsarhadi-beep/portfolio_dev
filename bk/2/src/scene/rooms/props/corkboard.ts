/** @module scene/rooms/props/corkboard: corkboard with six pinned notes (names: note-0..5). @see src/scene/rooms/props/index.ts, docs/ROOMS.md (1 content) */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { PALETTE, lighten } from '@/config/palette';
import type { PropFactory } from '@/config/types';

export const makeCorkboard: PropFactory = (ctx) => {
  const group = new THREE.Group();
  group.name = 'corkboard';

  const frame = new THREE.Mesh(new RoundedBoxGeometry(1.1, 0.7, 0.04, 1, 0.02), ctx.mat.woodDark);
  frame.castShadow = true;
  group.add(frame);

  const cork = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 0.6, 0.02),
    new THREE.MeshStandardMaterial({ color: lighten(PALETTE.wood, 0.18), roughness: 0.95, metalness: 0 }),
  );
  cork.position.z = 0.012;
  cork.receiveShadow = true;
  group.add(cork);

  // Six pinned notes in three tints, each with a pin.
  const noteGeo = new THREE.PlaneGeometry(0.14, 0.14);
  const tints = [PALETTE.white, lighten(PALETTE.butter, 0.25), PALETTE.white];
  const pinGeo = new THREE.SphereGeometry(0.012, 8, 8);
  const pinMat = new THREE.MeshStandardMaterial({ color: PALETTE.graphite, roughness: 0.4, metalness: 0.2 });
  const spots: Array<[number, number, number]> = [
    [-0.32, 0.16, 0.1], [-0.05, 0.18, -0.06], [0.24, 0.14, 0.08],
    [-0.25, -0.12, -0.05], [0.05, -0.14, 0.07], [0.32, -0.1, -0.08],
  ];
  spots.forEach(([x, y, rz], i) => {
    const note = new THREE.Mesh(noteGeo, new THREE.MeshStandardMaterial({
      color: tints[i % tints.length], roughness: 0.9, metalness: 0, side: THREE.DoubleSide,
    }));
    note.name = `note-${i}`;
    note.position.set(x, y, 0.03);
    note.rotation.z = rz;
    group.add(note);
    const pin = new THREE.Mesh(pinGeo, pinMat);
    pin.position.set(x, y + 0.06, 0.034);
    group.add(pin);
  });

  return group;
};
