/** @module scene/rooms/content/layout: places every prop in the writing studio. @see docs/ROOMS.md (1 content), src/scene/rooms/props/index.ts */
import * as THREE from 'three';
import { FOOTPRINT, WALL_THICK } from '@/config/tuning';
import { PALETTE, lighten } from '@/config/palette';
import type { RoomContext } from '@/config/types';

const FLOOR_HALF = FOOTPRINT / 2 - 0.26;
const WALL_CENTER = FLOOR_HALF - WALL_THICK; // center of the back walls
const WALL_FACE = WALL_CENTER - WALL_THICK / 2; // inner face of the back walls

export function buildLayout(ctx: RoomContext, room: THREE.Group): void {
  const p = ctx.props;

  const rug = p.rug(ctx, {});
  rug.position.set(0.35, 0, 0.55);
  room.add(rug);

  // Writing desk against the -z wall, chair facing it.
  const desk = p.desk(ctx, {});
  desk.position.set(-0.7, 0, -1.85);
  room.add(desk);

  const chair = p.chair(ctx, {});
  chair.position.set(-0.7, 0, -1.05);
  chair.rotation.y = Math.PI;
  room.add(chair);

  const laptop = p.laptop(ctx, {});
  laptop.position.set(-0.95, 0.8, -1.9);
  laptop.rotation.y = 0.2;
  room.add(laptop);

  const mug = p.mug(ctx, {});
  mug.position.set(-0.3, 0.8, -1.75);
  room.add(mug);

  const papers = p.papers(ctx, {});
  papers.position.set(0.25, 0.8, -1.9);
  papers.rotation.y = 0.35;
  room.add(papers);

  // Bookshelf against the -x wall.
  const shelf = p.shelf(ctx, { books: 24 });
  shelf.position.set(-2.42, 0, 0.7);
  shelf.rotation.y = Math.PI / 2;
  room.add(shelf);

  const corkboard = p.corkboard(ctx, {});
  corkboard.position.set(0.75, 1.2, -(WALL_FACE - 0.022));
  room.add(corkboard);

  // Editorial calendar (7 x 4 cells) drawn onto a wall frame on the -x wall.
  const calendar = p.frame(ctx, { w: 0.62, h: 0.52, draw: drawCalendar });
  calendar.position.set(-(WALL_FACE - 0.024), 1.2, -0.9);
  calendar.rotation.y = Math.PI / 2;
  room.add(calendar);

  const lamp = p.lamp(ctx, {});
  lamp.position.set(-2.25, 0, -2.2);
  room.add(lamp);

  const plant = p.plant(ctx, {});
  plant.position.set(2.3, 0, -2.3);
  room.add(plant);

  room.add(makePaperPlane());
}

/** Two folded triangles, white, doubleside. Animates on a loop (name: paperPlane). */
function makePaperPlane(): THREE.Group {
  const plane = new THREE.Group();
  plane.name = 'paperPlane';
  const mat = new THREE.MeshStandardMaterial({
    color: PALETTE.white, roughness: 0.6, metalness: 0, side: THREE.DoubleSide,
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute([
    0, 0, 0.14, 0, 0, -0.14, 0.1, 0, 0.06,
    0, 0, 0.14, -0.1, 0, 0.06, 0, 0, -0.14,
  ], 3));
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = false;
  plane.add(mesh);
  plane.position.set(0.3, 1.35, 0.2);
  return plane;
}

/** 7 x 4 calendar grid with a header band and a few filled days. */
function drawCalendar(c: CanvasRenderingContext2D, w: number, h: number): void {
  c.fillStyle = PALETTE.white;
  c.fillRect(0, 0, w, h);
  c.fillStyle = PALETTE.butter;
  c.fillRect(0, 0, w, h * 0.18);
  const cols = 7;
  const rows = 4;
  const cw = (w - 16) / cols;
  const ch = (h * 0.78) / rows;
  for (let r = 0; r < rows; r++) {
    for (let col = 0; col < cols; col++) {
      const x = 8 + col * cw;
      const y = h * 0.2 + r * ch;
      const filled = (r * cols + col) % 5 === 2;
      c.fillStyle = filled ? PALETTE.butter : lighten(PALETTE.wood, 0.2);
      c.fillRect(x + 2, y + 2, cw - 4, ch - 4);
    }
  }
}
