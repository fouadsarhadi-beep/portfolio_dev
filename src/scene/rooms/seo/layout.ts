/** @module scene/rooms/seo/layout: places the analytics command center props. @see docs/ROOMS.md (3 seo), src/scene/rooms/props/index.ts */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { PALETTE, lighten, darken } from '@/config/palette';
import type { RoomContext } from '@/config/types';
import { WALL_FACE } from '@/config/tuning';
import { makeCanvasTexture } from '../props/screen.ts';
import { drawDash, drawMetrics } from './anim';


export interface SeoHandles {
  dashTex: THREE.CanvasTexture;
  drawDash: (c: CanvasRenderingContext2D, w: number, h: number, t: number) => void;
  metricTex: THREE.CanvasTexture;
  drawMetrics: (c: CanvasRenderingContext2D, w: number, h: number, t: number) => void;
  glint: THREE.Mesh | null;
}

export function buildLayout(ctx: RoomContext, room: THREE.Group): SeoHandles {
  const p = ctx.props;
  const rug = p.rug(ctx, { color: `#${new THREE.Color(lighten(PALETTE.peach, 0.35)).getHexString()}`, glyph: ctx.layer.icon });
  rug.position.set(0.2, 0, 0.5);
  room.add(rug);

  const desk = p.desk(ctx, {});
  desk.position.set(-0.7, 0, -1.85);
  room.add(desk);

  // A ranking gauge on the desk: the room's plainest "this is SEO" icon.
  const gauge = p.gauge(ctx, {});
  gauge.position.set(0.62, 0.82, -1.72);
  room.add(gauge);

  // Laptop drawing a search-results panel.
  const laptop = p.laptop(ctx, {
    draw: (c: CanvasRenderingContext2D, w: number, h: number) => {
      c.fillStyle = PALETTE.white;
      c.fillRect(0, 0, w, h);
      c.fillStyle = PALETTE.peach;
      c.fillRect(w * 0.06, h * 0.08, w * 0.4, h * 0.06);
      for (let i = 0; i < 4; i++) {
        c.fillStyle = PALETTE.ink;
        c.fillRect(w * 0.06, h * (0.24 + i * 0.16), w * 0.5, h * 0.045);
        c.fillStyle = PALETTE.inkSoft;
        c.fillRect(w * 0.06, h * (0.31 + i * 0.16), w * 0.62, h * 0.035);
      }
    },
  });
  laptop.position.set(-0.95, 0.8, -1.9);
  laptop.rotation.y = 0.2;
  room.add(laptop);

  // Dashboard wall canvas on the -z wall.
  const dashSize = { w: 512, h: 256 };
  const dashTex = makeCanvasTexture(dashSize.w, dashSize.h, (c) => drawDash(c, dashSize.w, dashSize.h, 0));
  const dashPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(1.9, 0.95),
    new THREE.MeshBasicMaterial({ map: dashTex }),
  );
  dashPanel.position.set(0.55, 1.3, -(WALL_FACE - 0.02));
  room.add(dashPanel);

  // Metric tiles above the dashboard.
  const metricSize = { w: 256, h: 128 };
  const metricTex = makeCanvasTexture(metricSize.w, metricSize.h, (c) => drawMetrics(c, metricSize.w, metricSize.h, 0));
  const metricPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(0.95, 0.48),
    new THREE.MeshBasicMaterial({ map: metricTex }),
  );
  metricPanel.position.set(-1.5, 1.45, -(WALL_FACE - 0.02));
  room.add(metricPanel);

  // Keyword cards board with crawl strings on the -x wall.
  room.add(makeKeywordBoard(ctx, -(WALL_FACE - 0.03), 0.9));

  // Funnel of three stacked trapezoids.
  room.add(makeFunnel(ctx, 1.95, -1.9));

  // Podium with a "1".
  room.add(makePodium(ctx, -2.25, 0.2));

  // Magnifying glass on a stand; the glint sweeps the glass.
  const glint = makeMagnifier(ctx);
  glint.group.position.set(2.25, 0, -1.0);
  room.add(glint.group);

  return { dashTex, drawDash, metricTex, drawMetrics, glint: glint.glintMesh, };
}

function makeKeywordBoard(ctx: RoomContext, x: number, z: number): THREE.Group {
  const group = new THREE.Group();
  group.name = 'keywordBoard';
  group.rotation.y = Math.PI / 2;
  group.add(new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.6, 0.02), ctx.mat.woodDark));
  const cardGeo = new THREE.PlaneGeometry(0.22, 0.12);
  const spots: Array<[number, number]> = [[-0.22, 0.16], [0.12, 0.2], [-0.12, -0.1], [0.2, -0.14]];
  spots.forEach(([cx, cy], i) => {
    const card = new THREE.Mesh(cardGeo, new THREE.MeshStandardMaterial({
      color: i % 2 === 0 ? PALETTE.white : lighten(PALETTE.peach, 0.5),
      roughness: 0.9, metalness: 0, side: THREE.DoubleSide,
    }));
    card.position.set(cx, cy, 0.015);
    card.rotation.z = (i - 2) * 0.12;
    group.add(card);
  });
  // Crawl strings between the cards: thin peach boxes pinned at a slight angle.
  const stringGeo = new THREE.BoxGeometry(0.01, 0.3, 0.005);
  for (let i = 0; i < 3; i++) {
    const s = new THREE.Mesh(stringGeo, new THREE.MeshBasicMaterial({ color: PALETTE.peach }));
    s.position.set(spots[i][0] + 0.06, spots[i][1] - 0.1, 0.02);
    s.rotation.z = 0.5 + i * 0.3;
    group.add(s);
  }
  group.position.set(x, 1.2, z);
  return group;
}

function makeFunnel(ctx: RoomContext, x: number, z: number): THREE.Group {
  const group = new THREE.Group();
  group.name = 'funnel';
  // Closed frustum tiers with small gaps so the funnel reads from the iso view.
  const specs: Array<[number, number, number]> = [[0.36, 0.26, 0.1], [0.26, 0.17, 0.1], [0.17, 0.09, 0.1]];
  let y = 0.06;
  specs.forEach(([rt, rb, hh], i) => {
    const tier = new THREE.Mesh(
      new THREE.CylinderGeometry(rt, rb, hh, 24),
      new THREE.MeshStandardMaterial({
        color: i === 0 ? PALETTE.peach : lighten(PALETTE.peach, 0.2 + i * 0.15),
        roughness: 0.75, metalness: 0,
      }),
    );
    tier.position.y = y + hh / 2;
    tier.castShadow = true;
    group.add(tier);
    y += hh + 0.025;
  });
  group.position.set(x, 0, z);
  return group;
}

function makePodium(ctx: RoomContext, x: number, z: number): THREE.Group {
  const group = new THREE.Group();
  group.name = 'podium';
  const block = new THREE.Mesh(
    new RoundedBoxGeometry(0.3, 0.42, 0.3, 2, 0.03),
    new THREE.MeshStandardMaterial({ color: PALETTE.peach, roughness: 0.7, metalness: 0 }),
  );
  block.position.y = 0.21;
  block.castShadow = true;
  group.add(block);
  const tex = makeCanvasTexture(64, 64, (c) => {
    c.fillStyle = PALETTE.white;
    c.fillRect(0, 0, 64, 64);
    c.fillStyle = PALETTE.ink;
    c.font = "600 40px 'Fredoka Variable', sans-serif";
    c.textAlign = 'center';
    c.fillText('1', 32, 46);
  });
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.18), new THREE.MeshBasicMaterial({ map: tex }));
  face.position.set(0, 0.23, 0.155);
  group.add(face);
  group.position.set(x, 0, z);
  return group;
}

function makeMagnifier(ctx: RoomContext): { group: THREE.Group; glintMesh: THREE.Mesh } {
  const group = new THREE.Group();
  group.name = 'magnifier';
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.05, 16), ctx.mat.woodDark);
  base.position.y = 0.025;
  base.castShadow = true;
  group.add(base);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.5, 8), ctx.mat.graphite);
  post.position.y = 0.3;
  post.castShadow = true;
  group.add(post);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.025, 10, 28), ctx.mat.graphite);
  ring.position.y = 0.75;
  ring.rotation.x = -0.35;
  group.add(ring);
  const glass = new THREE.Mesh(
    new THREE.CircleGeometry(0.15, 24),
    new THREE.MeshStandardMaterial({ color: PALETTE.glow, roughness: 0.2, metalness: 0, transparent: true, opacity: 0.45 }),
  );
  glass.position.y = 0.75;
  glass.rotation.x = -0.35;
  group.add(glass);
  const glintMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.018, 8, 8),
    new THREE.MeshBasicMaterial({ color: PALETTE.white }),
  );
  glintMesh.position.y = 0.75;
  group.add(glintMesh);
  return { group, glintMesh };
}
