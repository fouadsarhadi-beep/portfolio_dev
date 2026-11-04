/** @module scene/rooms/props/shelf: bookshelf with instanced books (opts: books). @see src/scene/rooms/props/index.ts, docs/ROOMS.md */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { PALETTE, lighten, darken } from '@/config/palette';
import type { PropFactory } from '@/config/types';

const SHELF_W = 1.0;
const SHELF_H = 1.35;
const SHELF_D = 0.28;

export const makeShelf: PropFactory = (ctx, opts) => {
  const group = new THREE.Group();
  group.name = 'shelf';
  const bookCount = typeof opts?.books === 'number' ? opts.books : 24;

  const frameMat = ctx.mat.woodDark;
  const sideGeo = new RoundedBoxGeometry(0.05, SHELF_H, SHELF_D, 2, 0.03);
  for (const side of [-1, 1]) {
    const sideMesh = new THREE.Mesh(sideGeo, frameMat);
    sideMesh.position.set((side * (SHELF_W + 0.05)) / 2, SHELF_H / 2, 0);
    sideMesh.castShadow = true;
    group.add(sideMesh);
  }

  // Back panel keeps the shelf from reading as floating boards.
  const back = new THREE.Mesh(new THREE.BoxGeometry(SHELF_W + 0.05, SHELF_H, 0.02), frameMat);
  back.position.set(0, SHELF_H / 2, -SHELF_D / 2 + 0.01);
  group.add(back);

  const boardGeo = new RoundedBoxGeometry(SHELF_W, 0.04, SHELF_D, 2, 0.03);
  const shelfYs = [0.02, 0.46, 0.9, 1.33];
  for (const y of shelfYs) {
    const board = new THREE.Mesh(boardGeo, frameMat);
    board.position.y = y;
    board.castShadow = true;
    board.receiveShadow = true;
    group.add(board);
  }

  addBooks(group, bookCount, shelfYs);
  return group;
};

function addBooks(group: THREE.Group, count: number, shelfYs: number[]): void {
  const geo = new THREE.BoxGeometry(0.05, 1, 0.16); // unit height, scaled per book
  const mat = new THREE.MeshStandardMaterial({ color: PALETTE.white, roughness: 0.7, metalness: 0 });
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const pos = new THREE.Vector3();
  const scale = new THREE.Vector3();
  const colors = [
    PALETTE.butter, lighten(PALETTE.butter, 0.3), PALETTE.sage, PALETTE.white,
    darken(PALETTE.butter, 0.25), PALETTE.graphite,
  ];
  let placed = 0;
  const shelves = shelfYs.slice(0, 3); // bottom and two middle shelves carry books
  for (let b = 0; placed < count; b++) {
    const y = shelves[b % shelves.length];
    const run = Math.min(count - placed, 6 + (b % 2) * 2);
    for (let k = 0; k < run && placed < count; k++) {
      const h = 0.26 + ((placed * 13) % 5) * 0.02;
      const tilt = k === run - 1 && placed % 4 === 3 ? 0.22 : 0; // one leaning book per run
      pos.set(-SHELF_W / 2 + 0.1 + k * 0.062, y + 0.02 + h / 2, 0.02);
      q.setFromEuler(new THREE.Euler(0, 0, tilt));
      scale.set(1, h, 1);
      m.compose(pos, q, scale);
      mesh.setMatrixAt(placed, m);
      mesh.setColorAt(placed, new THREE.Color(colors[placed % colors.length]));
      placed++;
    }
  }
  mesh.castShadow = true;
  group.add(mesh);
}
