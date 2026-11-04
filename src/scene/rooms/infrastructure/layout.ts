/** @module scene/rooms/infrastructure/layout: places the server facility props. @see docs/ROOMS.md (7 infrastructure), src/scene/rooms/props/index.ts */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { FOOTPRINT, WALL_THICK } from '@/config/tuning';
import { PALETTE, lighten, darken } from '@/config/palette';
import type { RoomContext } from '@/config/types';
import { makeCanvasTexture } from '../props/screen.ts';
import { warnTexture, makeNetworkPanel } from './anim';

const FLOOR_HALF = FOOTPRINT / 2 - 0.26;
const WALL_FACE = FLOOR_HALF - WALL_THICK * 1.5;
const rackMat = () => new THREE.MeshStandardMaterial({ color: darken(PALETTE.steel, 0.35), roughness: 0.6, metalness: 0.2 });
const trimMat = () => new THREE.MeshStandardMaterial({ color: lighten(PALETTE.steel, 0.3), roughness: 0.5, metalness: 0.2 });

export interface InfraHandles {
  ledMeshes: THREE.InstancedMesh[];
  graphTex: THREE.CanvasTexture;
  statusLights: THREE.Mesh[];
  fans: THREE.Group[];
  ambient: THREE.PointLight;
}
export function buildLayout(ctx: RoomContext, room: THREE.Group): InfraHandles {
  const ledMeshes: THREE.InstancedMesh[] = [];
  room.add(makeRack(ctx, -2.3, -1.4, ledMeshes, 0));
  room.add(makeRack(ctx, -2.3, 0.9, ledMeshes, 1));
  makeFloorProps(ctx, room);
  const graphTex = makeCanvasTexture(256, 128, (c) => c.clearRect(0, 0, 256, 128));
  room.add(makeNetworkPanel(0.8, 1.25, -(WALL_FACE - 0.02), graphTex));

  const fans = [makeFan(ctx, 2.3, 1.1, 0), makeFan(ctx, 2.25, 2.0, Math.PI / 5)];
  fans.forEach((f) => room.add(f));
  const statusLights: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8),
      new THREE.MeshStandardMaterial({ color: PALETTE.glow, emissive: PALETTE.glow, emissiveIntensity: 1 }));
    led.name = `status-${i}`;
    led.position.set(1.45 + i * 0.14, 0.14, -1.7);
    statusLights.push(led);
    room.add(led);
  }
  const ambient = new THREE.PointLight(PALETTE.glow, 0.25, 4, 2);
  ambient.name = 'roomAmbient';
  ambient.position.set(0, 1.6, 0);
  room.add(ambient);
  return { ledMeshes, graphTex, statusLights, fans, ambient };
}
function makeRack(ctx: RoomContext, x: number, z: number, ledMeshes: THREE.InstancedMesh[], seed: number): THREE.Group {
  const group = new THREE.Group();
  group.name = `rack-${seed}`;
  const body = new THREE.Mesh(new RoundedBoxGeometry(0.6, 1.55, 0.5, 1, 0.03), rackMat());
  body.position.y = 0.775;
  body.castShadow = true;
  group.add(body);
  for (let i = 0; i < 4; i++) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.015, 0.4), trimMat());
    line.position.set(0, 0.35 + i * 0.28, 0.06);
    group.add(line);
  }
  const decal = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.1),
    new THREE.MeshBasicMaterial({ map: warnTexture(), transparent: true }));
  decal.rotation.y = Math.PI / 2;
  decal.position.set(0.302, 1.35, 0);
  group.add(decal);
  for (let row = 0; row < 2; row++) {
    const leds = new THREE.InstancedMesh(new THREE.BoxGeometry(0.03, 0.02, 0.01),
      new THREE.MeshBasicMaterial({ color: PALETTE.glow }), 8);
    const m = new THREE.Matrix4();
    for (let i = 0; i < 8; i++) {
      m.makeTranslation(-0.15 + i * 0.055, 0.45 + row * 0.54, 0.26);
      leds.setMatrixAt(i, m);
      leds.setColorAt(i, new THREE.Color(PALETTE.glow));
    }
    leds.name = `leds-${seed}-${row}`;
    ledMeshes.push(leds);
    group.add(leds);
  }
  group.position.set(x, 0, z);
  group.rotation.y = Math.PI / 2;
  return group;
}
function makeFloorProps(ctx: RoomContext, room: THREE.Group): void {
  const steel = new THREE.MeshStandardMaterial({ color: darken(PALETTE.steel, 0.2), roughness: 0.6, metalness: 0.2 });
  for (let i = 0; i < 3; i++) {
    const tray = new THREE.Mesh(new THREE.BoxGeometry(FOOTPRINT - 1.2, 0.02, 0.08), steel);
    tray.position.set(0, 0.06 + i * 0.015, -(WALL_FACE - 0.25) + i * 0.14);
    room.add(tray);
  }
  const router = new THREE.Group();
  router.name = 'router';
  const rbox = new THREE.Mesh(new RoundedBoxGeometry(0.3, 0.08, 0.22, 1, 0.03), rackMat());
  rbox.position.y = 0.04;
  rbox.castShadow = true;
  router.add(rbox);
  for (const side of [-1, 1]) {
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.16, 6), ctx.mat.graphite);
    ant.position.set(side * 0.1, 0.15, -0.05);
    ant.rotation.z = side * 0.15;
    router.add(ant);
  }
  router.position.set(1.6, 0, -2.0);
  room.add(router);
  const battery = new THREE.Group();
  battery.name = 'battery';
  const bbox = new THREE.Mesh(new RoundedBoxGeometry(0.36, 0.4, 0.26, 1, 0.03), rackMat());
  bbox.position.y = 0.2;
  bbox.castShadow = true;
  battery.add(bbox);
  const gauge = new THREE.Mesh(new THREE.CircleGeometry(0.07, 20), new THREE.MeshBasicMaterial({ color: PALETTE.glow }));
  gauge.position.set(0, 0.24, 0.135);
  battery.add(gauge);
  battery.position.set(2.2, 0, -0.6);
  battery.rotation.y = -0.4;
  room.add(battery);
  const coilMat = new THREE.MeshStandardMaterial({ color: PALETTE.white, roughness: 0.7, metalness: 0 });
  for (let i = 0; i < 3; i++) {
    const loop = new THREE.Mesh(new THREE.TorusGeometry(0.12 - i * 0.02, 0.02, 8, 22), coilMat);
    loop.rotation.x = Math.PI / 2;
    loop.position.set(1.3, 0.02 + i * 0.035, 1.3);
    loop.rotation.z = i * 0.4;
    room.add(loop);
  }
  const board = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 0.012), ctx.mat.woodDark);
  board.position.set(0.4, 0.11, -2.25);
  board.rotation.x = -0.25;
  room.add(board);
  const paper = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 0.17),
    new THREE.MeshStandardMaterial({ color: PALETTE.white, roughness: 0.9, metalness: 0 }));
  paper.position.set(0.4, 0.115, -2.242);
  paper.rotation.x = -0.25;
  room.add(paper);
}
function makeFan(ctx: RoomContext, x: number, z: number, yaw: number): THREE.Group {
  const group = new THREE.Group();
  group.name = 'coolFan';
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.02, 8, 24), rackMat());
  ring.position.y = 0.42;
  group.add(ring);
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.42, 8), ctx.mat.graphite);
  stand.position.y = 0.21;
  group.add(stand);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.03, 12), ctx.mat.graphite);
  base.position.y = 0.015;
  base.castShadow = true;
  group.add(base);
  const blades = new THREE.Group();
  blades.name = 'blades';
  for (let i = 0; i < 4; i++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.13, 0.01), trimMat());
    blade.position.y = 0.42;
    blade.rotation.z = (i / 4) * Math.PI * 2;
    blades.add(blade);
  }
  void ctx;
  blades.rotation.y = yaw;
  group.add(blades);
  group.position.set(x, 0, z);
  return group;
}
function makeCoil(ctx: RoomContext, x: number, z: number): THREE.Group {
  const group = new THREE.Group();
  group.name = 'coil';
  const mat = new THREE.MeshStandardMaterial({ color: PALETTE.white, roughness: 0.7, metalness: 0 });
  for (let i = 0; i < 3; i++) {
    const loop = new THREE.Mesh(new THREE.TorusGeometry(0.12 - i * 0.02, 0.02, 8, 22), mat);
    loop.rotation.x = Math.PI / 2;
    loop.position.y = 0.02 + i * 0.035;
    loop.rotation.z = i * 0.4;
    group.add(loop);
  }
  group.position.set(x, 0, z);
  return group;
}
function makeClipboard(ctx: RoomContext, x: number, z: number): THREE.Group {
  const group = new THREE.Group();
  group.name = 'clipboard';
  const board = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 0.012), ctx.mat.woodDark);
  board.position.set(0, 0.11, 0);
  board.rotation.x = -0.25;
  group.add(board);
  const paper = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 0.17),
    new THREE.MeshStandardMaterial({ color: PALETTE.white, roughness: 0.9, metalness: 0 }));
  paper.position.set(0, 0.115, 0.008);
  paper.rotation.x = -0.25;
  group.add(paper);
  group.position.set(x, 0, z);
  return group;
}