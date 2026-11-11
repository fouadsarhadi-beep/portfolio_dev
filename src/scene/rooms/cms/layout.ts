/** @module scene/rooms/cms/layout: places the publishing studio props. @see docs/ROOMS.md (6 cms), src/scene/rooms/props/index.ts */
import * as THREE from 'three';
import { PALETTE, lighten, darken } from '@/config/palette';
import type { RoomContext } from '@/config/types';
import { WALL_FACE } from '@/config/tuning';
import { makeCanvasTexture } from '../props/screen.ts';


export interface CmsHandles {
  blockTex: THREE.CanvasTexture;
  drawBlocks: (c: CanvasRenderingContext2D, w: number, h: number, t: number) => void;
  floaters: THREE.Group[];
  lights: THREE.Mesh[];
  calendarTex: THREE.CanvasTexture;
}

/** Block-editor UI whose blocks rearrange. */
export function drawBlocks(c: CanvasRenderingContext2D, w: number, h: number, t: number): void {
  c.fillStyle = PALETTE.white;
  c.fillRect(0, 0, w, h);
  c.fillStyle = PALETTE.sage;
  c.fillRect(0, 0, w, h * 0.09);
  const rows = 5;
  const seed = Math.floor(t * 0.8);
  for (let i = 0; i < rows; i++) {
    const wide = ((seed + i) % 3) * 0.12;
    c.fillStyle = i % 2 === 0 ? lighten(PALETTE.sage, 0.5) : PALETTE.white;
    c.strokeStyle = PALETTE.line;
    c.fillRect(w * 0.06, h * (0.16 + i * 0.15), w * (0.5 + wide), h * 0.1);
    c.strokeRect(w * 0.06, h * (0.16 + i * 0.15), w * (0.5 + wide), h * 0.1);
    c.fillStyle = PALETTE.inkSoft;
    c.fillRect(w * 0.1, h * (0.2 + i * 0.15), w * (0.3 + wide), h * 0.03);
  }
}

/** Editorial calendar whose day dots tick. */
export function drawCalendar(c: CanvasRenderingContext2D, w: number, h: number, t: number): void {
  c.fillStyle = PALETTE.white;
  c.fillRect(0, 0, w, h);
  c.fillStyle = PALETTE.sage;
  c.fillRect(0, 0, w, h * 0.18);
  const tick = Math.floor(t * 2) % 28;
  for (let i = 0; i < 28; i++) {
    const x = (i % 7) * (w / 7) + w * 0.05;
    const y = h * 0.26 + Math.floor(i / 7) * (h * 0.17);
    c.fillStyle = i === tick ? PALETTE.sage : lighten(PALETTE.wood, 0.2);
    c.beginPath();
    c.arc(x, y, w * 0.03, 0, Math.PI * 2);
    c.fill();
  }
}

export function buildLayout(ctx: RoomContext, room: THREE.Group): CmsHandles {
  const p = ctx.props;
  const rug = p.rug(ctx, { color: `#${new THREE.Color(lighten(PALETTE.sage, 0.35)).getHexString()}`, glyph: ctx.layer.icon });
  rug.position.set(0.2, 0, 0.5);
  room.add(rug);

  const desk = p.desk(ctx, {});
  desk.position.set(-0.7, 0, -1.85);
  room.add(desk);

  // Large monitor with the block-editor UI.
  const size = { w: 512, h: 320 };
  const blockTex = makeCanvasTexture(size.w, size.h, (c) => drawBlocks(c, size.w, size.h, 0));
  const monitor = p.monitor(ctx, { draw: (c: CanvasRenderingContext2D, w: number, h: number) => drawBlocks(c, w, h, 0) });
  monitor.position.set(-0.9, 0.8, -1.95);
  monitor.rotation.y = 0.25;
  monitor.scale.setScalar(1.15);
  room.add(monitor);

  const keyboard = p.keyboard(ctx, {});
  keyboard.position.set(-0.55, 0.815, -1.62);
  room.add(keyboard);

  // Content blocks are the CMS icon; the mug, lamp and plant were furniture.
  const cards = p.cardGrid(ctx, {});
  cards.position.set(2.05, 0.82, -1.45);
  cards.rotation.y = -0.35;
  room.add(cards);

  const shelf = p.shelf(ctx, { books: 18 });
  shelf.position.set(-2.42, 0, 1.1);
  shelf.rotation.y = Math.PI / 2;
  room.add(shelf);

  const drafts = p.papers(ctx, {});
  drafts.position.set(0.3, 0.8, -1.85);
  drafts.rotation.y = 0.3;
  room.add(drafts);

  const corkboard = p.corkboard(ctx, {});
  corkboard.position.set(0.9, 1.25, -(WALL_FACE - 0.024));
  room.add(corkboard);

  // Editorial calendar on the -x wall.
  const calendarTex = makeCanvasTexture(224, 160, (c) => drawCalendar(c, 224, 160, 0));
  const calendar = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.4), new THREE.MeshBasicMaterial({ map: calendarTex }));
  calendar.rotation.y = Math.PI / 2;
  calendar.position.set(-(WALL_FACE - 0.02), 1.25, -0.9);
  room.add(calendar);

  // Three floating content blocks above the desk.
  const floaters: THREE.Group[] = [];
  for (let i = 0; i < 3; i++) {
    const block = new THREE.Group();
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.14, 0.04),
      new THREE.MeshStandardMaterial({ color: i === 1 ? darken(PALETTE.sage, 0.1) : PALETTE.white, roughness: 0.8, metalness: 0 }),
    );
    box.castShadow = false;
    block.add(box);
    block.position.set(0.15 + i * 0.55, 1.55 + (i % 2) * 0.18, -0.7 + (i % 2) * 0.5);
    block.name = `floater-${i}`;
    floaters.push(block);
    room.add(block);
  }

  // Publish status lights on the desk edge.
  const lights: THREE.Mesh[] = [];
  [PALETTE.ledGreen, PALETTE.ledAmber, PALETTE.ledRed].forEach((col, i) => {
    const led = new THREE.Mesh(
      new THREE.SphereGeometry(0.02, 8, 8),
      new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.8 }),
    );
    led.name = `pub-${i}`;
    led.position.set(-0.15 + i * 0.07, 0.82, -1.5);
    lights.push(led);
    room.add(led);
  });

  return { blockTex, drawBlocks, floaters, lights, calendarTex };
}
