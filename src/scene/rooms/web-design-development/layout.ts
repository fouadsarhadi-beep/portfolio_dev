/** @module scene/rooms/web-design-development/layout: places the merged workspace props. @see docs/ROOMS.md (4), src/scene/rooms/props/index.ts */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { PALETTE, lighten } from '@/config/palette';
import type { RoomContext } from '@/config/types';
import { WALL_FACE } from '@/config/tuning';
import { makeCanvasTexture } from '../props/screen.ts';
import { drawEditor, drawStroke, drawBrowser } from './anim';


export interface WddHandles {
  editorTex: THREE.CanvasTexture;
  drawEditor: (c: CanvasRenderingContext2D, w: number, h: number, t: number) => void;
  easelTex: THREE.CanvasTexture;
  drawStroke: (c: CanvasRenderingContext2D, w: number, h: number, t: number) => void;
  ledStrip: THREE.Mesh | null;
  duck: THREE.Object3D | null;
}
export function buildLayout(ctx: RoomContext, room: THREE.Group): WddHandles {
  const p = ctx.props;
  const rug = p.rug(ctx, { color: `#${new THREE.Color(lighten(PALETTE.rose, 0.35)).getHexString()}`, glyph: ctx.layer.icon });
  rug.position.set(0.2, 0, 0.5);
  room.add(rug);
  // L-shaped workstation: development desk on the -z wall, drafting arm on +x.
  const devDesk = p.desk(ctx, {});
  devDesk.position.set(-0.7, 0, -1.85);
  room.add(devDesk);
  const draftDesk = p.desk(ctx, {});
  draftDesk.position.set(2.1, 0, 0.9);
  draftDesk.rotation.y = -Math.PI / 2;
  room.add(draftDesk);
  const chair = p.chair(ctx, {});
  chair.position.set(-0.7, 0, -1.05);
  chair.rotation.y = Math.PI;
  room.add(chair);
  // Dual monitors on the dev desk: editor + browser preview.
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
  keyboard.position.set(-0.55, 0.815, -1.62);
  keyboard.rotation.y = 0.1;
  room.add(keyboard);
  const duck = p.duck(ctx, {});
  duck.position.set(0.35, 0.815, -1.75);
  room.add(duck);
  const ledStrip = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.03, 0.02),
    new THREE.MeshStandardMaterial({ color: PALETTE.blue, emissive: PALETTE.blue, emissiveIntensity: 1.2, roughness: 0.4, metalness: 0 }));
  ledStrip.name = 'ledStrip';
  ledStrip.position.set(-0.7, 0.68, -1.42);
  room.add(ledStrip);
  // Inspiration wall on -z: mood board (left) beside the component-card grid (right).
  const moodBoard = p.moodBoard(ctx, {});
  moodBoard.position.set(-1.5, 1.3, -(WALL_FACE - 0.03));
  room.add(moodBoard);
  const cardGrid = p.cardGrid(ctx, {});
  cardGrid.position.set(0.6, 1.3, -(WALL_FACE - 0.02));
  room.add(cardGrid);
  // Standards panel on -x: token rack + performance gauge.
  const tokenRack = p.tokenRack(ctx, {});
  tokenRack.position.set(-(WALL_FACE - 0.03), 1.0, 0.8);
  room.add(tokenRack);
  const gauge = p.gauge(ctx, {});
  gauge.position.set(-(WALL_FACE - 0.03), 1.4, -0.7);
  room.add(gauge);
  // Easel in the front-left area, facing the room.
  const easelTex = makeCanvasTexture(256, 256, (c) => drawStroke(c, 256, 256, 0));
  const easel = p.easel(ctx, { tex: easelTex });
  easel.position.set(-2.2, 0, 0.8);
  easel.rotation.y = 0.6;
  room.add(easel);
  // Drafting arm props: tablet, stylus, chip fan.
  const tablet = new THREE.Mesh(new RoundedBoxGeometry(0.34, 0.02, 0.24, 1, 0.02),
    new THREE.MeshStandardMaterial({ color: PALETTE.graphite, roughness: 0.4, metalness: 0.1 }));
  tablet.position.set(2.05, 0.8, 0.85);
  tablet.rotation.y = Math.PI / 2;
  room.add(tablet);
  const stylus = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.16, 8), ctx.mat.white);
  stylus.position.set(2.2, 0.82, 0.55);
  stylus.rotation.z = Math.PI / 2;
  room.add(stylus);
  const chipFan = p.chipFan(ctx, {});
  chipFan.position.set(2.25, 0.82, 1.3);
  room.add(chipFan);
  // No plant here either: the drafting desk, the easel, the monitors and the
  // chip fan already say "design and front-end".
  return { editorTex, drawEditor, easelTex, drawStroke, ledStrip, duck };
}
