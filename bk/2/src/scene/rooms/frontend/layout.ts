/** @module scene/rooms/frontend/layout: places the development workspace props. @see docs/ROOMS.md (5 frontend), src/scene/rooms/props/index.ts */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { FOOTPRINT, WALL_THICK } from '@/config/tuning';
import { PALETTE, lighten } from '@/config/palette';
import type { RoomContext } from '@/config/types';
import { makeCanvasTexture } from '../props/screen.ts';

const FLOOR_HALF = FOOTPRINT / 2 - 0.26;
const WALL_FACE = FLOOR_HALF - WALL_THICK * 1.5;

export interface FrontendHandles {
  editorTex: THREE.CanvasTexture;
  drawEditor: (c: CanvasRenderingContext2D, w: number, h: number, t: number) => void;
  cards: THREE.Mesh[];
  gaugeNeedle: THREE.Object3D | undefined;
  ledStrip: THREE.Mesh | null;
  duck: THREE.Group | null;
}

/** Code editor whose code types itself. */
export function drawEditor(c: CanvasRenderingContext2D, w: number, h: number, t: number): void {
  c.fillStyle = PALETTE.graphite;
  c.fillRect(0, 0, w, h);
  const lines = [
    'const stack = build();',
    'stack.lift(step);',
    'if (resting) slam();',
    'render(scene, cam);',
  ];
  const total = 26;
  let shown = Math.floor((t * 0.6) % (total + 6));
  c.font = "600 16px 'DM Sans Variable', monospace";
  lines.forEach((line, i) => {
    const take = Math.max(0, Math.min(line.length, shown));
    shown -= line.length + 2;
    if (take > 0) {
      c.fillStyle = i % 2 === 0 ? PALETTE.glow : PALETTE.butter;
      c.fillText(line.slice(0, take), 16, 40 + i * 34);
    }
  });
  const blink = Math.floor(t * 2) % 2 === 0;
  if (blink) {
    c.fillStyle = PALETTE.white;
    c.fillRect(16, 150, 12, 18);
  }
}

/** Browser preview pane. */
export function drawBrowser(c: CanvasRenderingContext2D, w: number, h: number): void {
  c.fillStyle = PALETTE.white;
  c.fillRect(0, 0, w, h);
  c.fillStyle = lighten(PALETTE.graphite, 0.2);
  c.fillRect(0, 0, w, h * 0.12);
  c.fillStyle = PALETTE.white;
  c.fillRect(w * 0.04, h * 0.03, w * 0.6, h * 0.06);
  c.fillStyle = PALETTE.blue;
  c.fillRect(w * 0.06, h * 0.2, w * 0.4, h * 0.1);
  c.fillStyle = PALETTE.inkSoft;
  c.fillRect(w * 0.06, h * 0.36, w * 0.88, h * 0.05);
  c.fillRect(w * 0.06, h * 0.46, w * 0.7, h * 0.05);
  c.fillStyle = PALETTE.sage;
  c.fillRect(w * 0.06, h * 0.6, w * 0.3, h * 0.18);
  c.fillStyle = PALETTE.butter;
  c.fillRect(w * 0.42, h * 0.6, w * 0.3, h * 0.18);
}

export function buildLayout(ctx: RoomContext, room: THREE.Group): FrontendHandles {
  const p = ctx.props;
  const rug = p.rug(ctx, { color: `#${new THREE.Color(lighten(PALETTE.blue, 0.4)).getHexString()}` });
  rug.position.set(0.2, 0, 0.5);
  room.add(rug);

  const desk = p.desk(ctx, {});
  desk.position.set(-0.7, 0, -1.85);
  room.add(desk);

  const chair = p.chair(ctx, {});
  chair.position.set(-0.7, 0, -1.05);
  chair.rotation.y = Math.PI;
  room.add(chair);

  const editorTex = makeCanvasTexture(512, 320, (c) => drawEditor(c, 512, 320, 0));
  const editor = p.monitor(ctx, { draw: (c: CanvasRenderingContext2D, w: number, h: number) => drawEditor(c, w, h, 0) });
  editor.position.set(-1.15, 0.8, -1.95);
  editor.rotation.y = 0.4;
  room.add(editor);
  const browser = p.monitor(ctx, { draw: (c: CanvasRenderingContext2D, w: number, h: number) => drawBrowser(c, w, h) });
  browser.position.set(-0.35, 0.8, -1.85);
  browser.rotation.y = -0.15;
  browser.scale.setScalar(0.85);
  room.add(browser);
  const keyboard = p.keyboard(ctx, {});
  keyboard.position.set(-0.5, 0.815, -1.62);
  keyboard.rotation.y = 0.1;
  room.add(keyboard);
  const duck = makeDuck(ctx);
  duck.position.set(0.35, 0.815, -1.75);
  room.add(duck);
  const ledStrip = new THREE.Mesh(
    new THREE.BoxGeometry(1.7, 0.03, 0.02),
    new THREE.MeshStandardMaterial({
      color: PALETTE.glow, emissive: PALETTE.glow, emissiveIntensity: 1.2, roughness: 0.4, metalness: 0,
    }),
  );
  ledStrip.name = 'ledStrip';
  ledStrip.position.set(-0.7, 0.68, -1.42);
  room.add(ledStrip);
  // Component cards grid on the -z wall; cards snap in one by one.
  const cards: THREE.Mesh[] = [];
  room.add(makeCardGrid(ctx, 0.6, 1.3, -(WALL_FACE - 0.02), cards));

  // Token swatch rack on the -x wall.
  room.add(makeTokenRack(ctx, -(WALL_FACE - 0.03), 0.8));

  // Performance gauge on the -x wall.
  const gauge = makeGauge(ctx);
  gauge.position.set(-(WALL_FACE - 0.03), 1.4, -0.7);
  room.add(gauge);
  const gaugeNeedle = gauge.getObjectByName('needle');

  return { editorTex, drawEditor, cards, gaugeNeedle, ledStrip, duck };
}

function makeDuck(ctx: RoomContext): THREE.Group {
  const group = new THREE.Group();
  group.name = 'duck';
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 14, 12),
    new THREE.MeshStandardMaterial({ color: PALETTE.glow, roughness: 0.5, metalness: 0 }),
  );
  body.scale.set(1.2, 0.9, 1);
  body.position.y = 0.045;
  body.castShadow = true;
  group.add(body);
  const headMat = body.material as THREE.Material;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.032, 12, 10), headMat);
  head.position.set(0.045, 0.1, 0);
  group.add(head);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.03, 8),
    new THREE.MeshStandardMaterial({ color: PALETTE.peach, roughness: 0.6, metalness: 0 }));
  beak.position.set(0.08, 0.095, 0);
  beak.rotation.z = -Math.PI / 2;
  group.add(beak);
  return group;
}

function makeCardGrid(ctx: RoomContext, x: number, y: number, z: number, cards: THREE.Mesh[]): THREE.Group {
  const group = new THREE.Group();
  group.name = 'cardGrid';
  const cardGeo = new THREE.PlaneGeometry(0.26, 0.16);
  for (let i = 0; i < 6; i++) {
    const card = new THREE.Mesh(cardGeo, new THREE.MeshStandardMaterial({
      color: i % 2 === 0 ? PALETTE.white : lighten(PALETTE.blue, 0.45),
      roughness: 0.9, metalness: 0, side: THREE.DoubleSide,
    }));
    card.position.set(-0.42 + (i % 3) * 0.42, i < 3 ? 0.22 : -0.02, 0);
    card.name = `card-${i}`;
    cards.push(card);
    group.add(card);
  }
  group.position.set(x, y, z);
  return group;
}

function makeTokenRack(ctx: RoomContext, x: number, z: number): THREE.Group {
  const group = new THREE.Group();
  group.name = 'tokenRack';
  group.rotation.y = Math.PI / 2;
  group.add(new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.26, 0.03), ctx.mat.woodDark));
  const chipGeo = new THREE.BoxGeometry(0.1, 0.18, 0.04);
  const tokens = [PALETTE.blue, lighten(PALETTE.blue, 0.3), PALETTE.white, PALETTE.graphite];
  tokens.forEach((col, i) => {
    const chip = new THREE.Mesh(chipGeo, new THREE.MeshStandardMaterial({ color: col, roughness: 0.6, metalness: 0 }));
    chip.position.set(-0.21 + i * 0.14, 0, 0.03);
    group.add(chip);
  });
  group.position.set(x, 1.0, z);
  return group;
}

function makeGauge(ctx: RoomContext): THREE.Group {
  const group = new THREE.Group();
  group.name = 'gauge';
  const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.03, 24),
    new THREE.MeshStandardMaterial({ color: PALETTE.white, roughness: 0.7, metalness: 0 }));
  dial.rotation.x = Math.PI / 2;
  group.add(dial);
  group.add(new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.015, 8, 28), ctx.mat.graphite));
  const needle = new THREE.Group();
  needle.name = 'needle';
  const stick = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.15, 0.012), new THREE.MeshBasicMaterial({ color: PALETTE.graphite }));
  stick.position.y = 0.07;
  needle.add(stick);
  needle.position.z = 0.03;
  group.add(needle);
  return group;
}
