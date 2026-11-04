/** @module scene/rooms/design/layout: places the design studio props. @see docs/ROOMS.md (4 design), src/scene/rooms/props/index.ts */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { FOOTPRINT, WALL_THICK } from '@/config/tuning';
import { PALETTE, lighten, darken } from '@/config/palette';
import type { RoomContext } from '@/config/types';
import { makeCanvasTexture } from '../props/screen.ts';

const FLOOR_HALF = FOOTPRINT / 2 - 0.26;
const WALL_FACE = FLOOR_HALF - WALL_THICK * 1.5;
const SWATCH_COLORS = [PALETTE.rose, PALETTE.butter, PALETTE.blue, PALETTE.sage, PALETTE.peach, PALETTE.lilac];

export interface DesignHandles {
  easelTex: THREE.CanvasTexture;
  swatches: THREE.Mesh[];
  fanPivot: THREE.Group | null;
  posterTex: THREE.CanvasTexture;
}

export function buildLayout(ctx: RoomContext, room: THREE.Group): DesignHandles {
  const p = ctx.props;
  const rug = p.rug(ctx, { color: `#${new THREE.Color(lighten(PALETTE.rose, 0.35)).getHexString()}` });
  rug.position.set(0.2, 0, 0.5);
  room.add(rug);

  // Drafting table: the desk, angled slightly like a drafting bench.
  const desk = p.desk(ctx, {});
  desk.position.set(-0.7, 0, -1.85);
  room.add(desk);
  const stool = p.chair(ctx, {});
  stool.position.set(-0.7, 0, -1.0);
  stool.rotation.y = Math.PI;
  room.add(stool);

  // Tablet and stylus on the desk.
  const tablet = new THREE.Mesh(
    new RoundedBoxGeometry(0.34, 0.02, 0.24, 1, 0.02),
    new THREE.MeshStandardMaterial({ color: PALETTE.graphite, roughness: 0.4, metalness: 0.1 }),
  );
  tablet.position.set(0.15, 0.81, -1.8);
  tablet.rotation.y = -0.4;
  room.add(tablet);
  const stylus = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.16, 8), ctx.mat.white);
  stylus.position.set(0.22, 0.83, -1.72);
  stylus.rotation.z = Math.PI / 2 - 0.2;
  room.add(stylus);

  // Easel with a canvas on the right; a stroke draws itself.
  const easelSize = { w: 256, h: 256 };
  const easelTex = makeCanvasTexture(easelSize.w, easelSize.h, (c) => drawStroke(c, easelSize.w, easelSize.h, 0));
  room.add(makeEasel(ctx, 1.85, -1.85, easelTex));

  // Mood board with swatch cards on the -z wall; swatches highlight in turn.
  const swatches: THREE.Mesh[] = [];
  room.add(makeMoodBoard(ctx, 0.55, 1.3, -(WALL_FACE - 0.03), swatches));

  // Poster with a swapping glyph on the -x wall.
  const posterTex = makeCanvasTexture(160, 200, (c) => drawGlyph(c, 160, 200, 0));
  room.add(makePoster(ctx, -(WALL_FACE - 0.03), -0.8, posterTex));

  // Color-chip fan on the desk; it opens and closes slowly.
  const fanPivot = makeChipFan(ctx);
  fanPivot.position.set(-1.3, 0.82, -1.75);
  room.add(fanPivot);

  const plant = p.plant(ctx, {});
  plant.position.set(2.3, 0, -2.3);
  room.add(plant);

  return { easelTex, swatches, fanPivot, posterTex };
}

/** A stroke draws itself across the easel canvas. */
export function drawStroke(c: CanvasRenderingContext2D, w: number, h: number, t: number): void {
  c.fillStyle = PALETTE.white;
  c.fillRect(0, 0, w, h);
  c.strokeStyle = darken(PALETTE.rose, 0.25);
  c.lineWidth = 8;
  c.strokeRect(6, 6, w - 12, h - 12);
  c.strokeStyle = PALETTE.rose;
  c.lineWidth = 10;
  c.lineCap = 'round';
  c.beginPath();
  const p = (t * 0.25) % 1.2;
  const pts: Array<[number, number]> = [[40, 180], [80, 90], [128, 150], [176, 70], [216, 140]];
  c.moveTo(pts[0][0], pts[0][1]);
  let budget = p * 520;
  for (let i = 1; i < pts.length && budget > 0; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const seg = Math.hypot(x1 - x0, y1 - y0);
    const f = Math.min(1, budget / seg);
    c.lineTo(x0 + (x1 - x0) * f, y0 + (y1 - y0) * f);
    budget -= seg;
  }
  c.stroke();
  c.fillStyle = PALETTE.inkSoft;
  c.font = "600 22px 'Fredoka Variable', sans-serif";
  c.fillText('Sketch 01', 24, 48);
}

/** The poster glyph swaps: Aa, Bb, Cc. */
export function drawGlyph(c: CanvasRenderingContext2D, w: number, h: number, t: number): void {
  const glyphs = ['Aa', 'Bb', 'Cc'];
  const g = glyphs[Math.floor(t * 0.5) % glyphs.length];
  c.fillStyle = PALETTE.rose;
  c.fillRect(0, 0, w, h);
  c.fillStyle = PALETTE.white;
  c.font = "600 90px 'Fredoka Variable', sans-serif";
  c.textAlign = 'center';
  c.fillText(g, w / 2, h * 0.62);
}

function makeEasel(ctx: RoomContext, x: number, z: number, tex: THREE.CanvasTexture): THREE.Group {
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
  const canvas = new THREE.Mesh(
    new THREE.BoxGeometry(0.52, 0.52, 0.02),
    new THREE.MeshStandardMaterial({ color: PALETTE.white, roughness: 0.9, metalness: 0 }),
  );
  canvas.position.set(0, 0.88, 0.02);
  canvas.rotation.x = -0.08;
  canvas.castShadow = true;
  group.add(canvas);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.46), new THREE.MeshBasicMaterial({ map: tex }));
  face.position.set(0, 0.88, 0.036);
  face.rotation.x = -0.08;
  group.add(face);
  group.position.set(x, 0, z);
  group.rotation.y = -1.15;
  return group;
}

function makeMoodBoard(ctx: RoomContext, x: number, y: number, z: number, swatches: THREE.Mesh[]): THREE.Group {
  const group = new THREE.Group();
  group.name = 'moodBoard';
  group.add(new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.6, 0.02), ctx.mat.woodDark));
  const swatchGeo = new THREE.PlaneGeometry(0.18, 0.18);
  for (let i = 0; i < 6; i++) {
    const sw = new THREE.Mesh(swatchGeo, new THREE.MeshStandardMaterial({
      color: SWATCH_COLORS[i], roughness: 0.8, metalness: 0,
    }));
    sw.position.set(-0.32 + (i % 3) * 0.32, i < 3 ? 0.12 : -0.14, 0.02);
    sw.name = `swatch-${i}`;
    swatches.push(sw);
    group.add(sw);
  }
  group.position.set(x, y, z);
  return group;
}

function makePoster(ctx: RoomContext, x: number, z: number, tex: THREE.CanvasTexture): THREE.Group {
  const group = new THREE.Group();
  group.name = 'poster';
  group.rotation.y = Math.PI / 2;
  const paper = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.015), ctx.mat.white);
  group.add(paper);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.46), new THREE.MeshBasicMaterial({ map: tex }));
  face.position.z = 0.01;
  group.add(face);
  group.position.set(x, 1.3, z);
  return group;
}

function makeChipFan(ctx: RoomContext): THREE.Group {
  const group = new THREE.Group();
  group.name = 'chipFan';
  const pivot = new THREE.Group();
  pivot.name = 'fanPivot';
  const chipGeo = new RoundedBoxGeometry(0.22, 0.05, 0.05, 1, 0.02);
  for (let i = 0; i < 6; i++) {
    const chip = new THREE.Mesh(chipGeo, new THREE.MeshStandardMaterial({
      color: SWATCH_COLORS[i], roughness: 0.7, metalness: 0,
    }));
    chip.position.set(0.14, 0, 0);
    const arm = new THREE.Group();
    arm.rotation.y = (i - 2.5) * 0.18;
    arm.add(chip);
    pivot.add(arm);
  }
  group.add(pivot);
  return group;
}
