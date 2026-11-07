/** @module scene/rooms/translation/layout: places the language studio props. @see docs/ROOMS.md (2 translation), src/scene/rooms/props/index.ts */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { FOOTPRINT, WALL_THICK } from '@/config/tuning';
import { PALETTE, lighten, darken } from '@/config/palette';
import type { RoomContext } from '@/config/types';
import { makeCanvasTexture } from '../props/screen.ts';

const FLOOR_HALF = FOOTPRINT / 2 - 0.26;
const WALL_FACE = FLOOR_HALF - WALL_THICK * 1.5; // inner face of the back walls

export interface TranslationHandles {
  screenTex: THREE.CanvasTexture;
  drawScreen: (ctx: CanvasRenderingContext2D, w: number, h: number, pair: number) => void;
  screenSize: { w: number; h: number };
  globe: THREE.Group | null;
  bubbles: THREE.Object3D[];
  headphones: THREE.Group | null;
}

/** Dual-pane screen: an English and a Persian greeting side by side. */
export function drawDualPane(c: CanvasRenderingContext2D, w: number, h: number, pair = 0): void {
  c.fillStyle = PALETTE.white;
  c.fillRect(0, 0, w, h);
  c.fillStyle = PALETTE.lilac;
  c.fillRect(0, 0, w * 0.5, h * 0.1);
  c.fillRect(w * 0.5, 0, w * 0.5, h * 0.1);
  const pairs = [['Hello', 'سلام'], ['Welcome', 'خوش آمدید']];
  const [en, fa] = pairs[pair % pairs.length];
  c.fillStyle = PALETTE.ink;
  c.font = `600 ${h * 0.2}px 'DM Sans Variable', sans-serif`;
  c.textAlign = 'center';
  c.fillText(en, w * 0.25, h * 0.5);
  c.font = `600 ${h * 0.2}px sans-serif`;
  c.fillText(fa, w * 0.75, h * 0.5);
  if (pair % 2 === 0) {
    c.fillStyle = PALETTE.lilac;
    c.fillRect(w * 0.25 - h * 0.06, h * 0.58, h * 0.03, h * 0.05);
  }
}

export function buildLayout(ctx: RoomContext, room: THREE.Group): TranslationHandles {
  const p = ctx.props;

  const rug = p.rug(ctx, {
    color: `#${new THREE.Color(lighten(PALETTE.lilac, 0.22)).getHexString()}`,
    glyph: ctx.layer.icon,
  });
  rug.position.set(0.3, 0, 0.55);
  room.add(rug);

  const desk = p.desk(ctx, {});
  desk.position.set(-0.7, 0, -1.85);
  room.add(desk);

  // Dual-pane monitor on the desk.
  const size = { w: 512, h: 320 };
  const drawScreen = (c: CanvasRenderingContext2D, w: number, h: number, p2: number): void => drawDualPane(c, w, h, p2);
  const monitor = p.monitor(ctx, { draw: drawScreen });
  monitor.position.set(-0.9, 0.8, -1.9);
  monitor.rotation.y = 0.15;
  room.add(monitor);
  const screenMesh = monitor.getObjectByName('screen') as THREE.Mesh;
  const screenTex = (screenMesh.material as THREE.MeshBasicMaterial).map as THREE.CanvasTexture;
  const headphones = makeHeadphones(ctx);
  headphones.position.set(0.15, 0.81, -1.7);
  room.add(headphones);
  const globe = makeGlobe(ctx);
  globe.position.set(1.95, 0, -2.0);
  room.add(globe);
  room.add(makeDictStack(ctx, -2.15, -0.9));
  // No plant: the globe, the dictionary stack and the two speech bubbles are the
  // room's icons, and one more leafy shape made them harder to read.
  // Two speech-bubble signs on the -z wall; they pop in turn.
  const bubbles: THREE.Object3D[] = [];
  [[-0.9, 1.25, -0.9], [0.4, 1.35, 0.8]].forEach(([x, y, rz], i) => {
    const bubble = makeBubble(ctx, i === 0 ? 'EN' : 'FA');
    bubble.position.set(x, y, -(WALL_FACE - 0.05));
    bubble.rotation.z = rz;
    bubble.name = `bubble-${i}`;
    bubbles.push(bubble);
    room.add(bubble);
  });
  room.add(makeGlossaryBoard(ctx, -(WALL_FACE - 0.03), 0.7));
  return { screenTex, drawScreen, screenSize: size, globe, bubbles, headphones };
}

function makeHeadphones(ctx: RoomContext): THREE.Group {
  const group = new THREE.Group();
  group.name = 'headphones';
  group.add(new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.016, 8, 20, Math.PI), ctx.mat.graphite));
  const cupGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.03, 14);
  for (const side of [-1, 1]) {
    const cup = new THREE.Mesh(cupGeo, ctx.mat.white);
    cup.rotation.z = Math.PI / 2;
    cup.position.set(side * 0.11, -0.02, 0);
    group.add(cup);
  }
  group.rotation.x = -0.5;
  return group;
}

function makeGlobe(ctx: RoomContext): THREE.Group {
  const group = new THREE.Group();
  group.name = 'globe';
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.06, 16), ctx.mat.woodDark);
  stand.position.y = 0.03;
  stand.castShadow = true;
  group.add(stand);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.14, 8), ctx.mat.graphite);
  post.position.y = 0.13;
  group.add(post);
  const spinner = new THREE.Group();
  spinner.name = 'spinner';
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 20, 16),
    new THREE.MeshStandardMaterial({ color: PALETTE.lilac, roughness: 0.55, metalness: 0 }),
  );
  sphere.position.y = 0.34;
  sphere.castShadow = true;
  spinner.add(sphere);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.008, 8, 30), ctx.mat.graphite);
  ring.position.y = 0.34;
  ring.rotation.x = Math.PI / 2 - 0.4;
  spinner.add(ring);
  const blob = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 10, 8),
    new THREE.MeshStandardMaterial({ color: PALETTE.white, roughness: 0.7, metalness: 0 }),
  );
  blob.position.set(0.06, 0.38, 0.07);
  blob.scale.set(1, 0.6, 0.8);
  spinner.add(blob);
  group.add(spinner);
  return group;
}

function makeDictStack(ctx: RoomContext, x: number, z: number): THREE.Group {
  const group = new THREE.Group();
  group.name = 'dictStack';
  const geo = new RoundedBoxGeometry(0.3, 0.07, 0.22, 1, 0.03);
  [darken(PALETTE.lilac, 0.15), PALETTE.lilac, lighten(PALETTE.lilac, 0.3)].forEach((col, i) => {
    const book = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: col, roughness: 0.7, metalness: 0 }));
    book.position.set((i % 2 - 0.5) * 0.03, 0.035 + i * 0.07, 0);
    book.rotation.y = (i - 1) * 0.25;
    book.castShadow = true;
    group.add(book);
  });
  group.position.set(x, 0, z);
  return group;
}

function makeBubble(ctx: RoomContext, label: string): THREE.Group {
  const group = new THREE.Group();
  group.add(new THREE.Mesh(
    new RoundedBoxGeometry(0.34, 0.2, 0.06, 2, 0.03),
    new THREE.MeshStandardMaterial({ color: PALETTE.white, roughness: 0.8, metalness: 0 }),
  ));
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.08, 3), ctx.mat.white);
  tail.position.set(0.06, -0.12, 0);
  tail.rotation.x = Math.PI;
  group.add(tail);
  const tex = makeCanvasTexture(96, 56, (c) => {
    c.fillStyle = PALETTE.ink;
    c.font = "600 30px 'DM Sans Variable', sans-serif";
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(label, 48, 30);
  });
  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(0.3, 0.17),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true }),
  );
  face.position.z = 0.032;
  group.add(face);
  return group;
}

function makeGlossaryBoard(ctx: RoomContext, x: number, z: number): THREE.Group {
  const group = new THREE.Group();
  group.name = 'glossary';
  group.rotation.y = Math.PI / 2;
  group.add(new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 0.02), ctx.mat.woodDark));
  const cardGeo = new THREE.PlaneGeometry(0.14, 0.1);
  [[-0.18, 0.12, 0.06], [0.06, 0.14, -0.05], [-0.1, -0.08, -0.07], [0.16, -0.06, 0.08]].forEach(([cx, cy, rz], i) => {
    const card = new THREE.Mesh(cardGeo, new THREE.MeshStandardMaterial({
      color: i % 2 === 0 ? PALETTE.white : lighten(PALETTE.lilac, 0.4),
      roughness: 0.9, metalness: 0, side: THREE.DoubleSide,
    }));
    card.position.set(cx, cy, 0.015);
    card.rotation.z = rz;
    group.add(card);
  });
  group.position.set(x, 1.15, z);
  return group;
}
