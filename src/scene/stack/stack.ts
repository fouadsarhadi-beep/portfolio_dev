/** @module scene/stack/stack: builds the six-slab column from config in locked order. @see src/scene/stack/slab.ts, src/scene/rooms/index.ts, docs/MOTION.md (State) */
import * as THREE from 'three';
import { SLAB_T, FOOTPRINT, WALL_H, STACK_BASE_Y } from '@/config/tuning';
import { LAYERS } from '@/config/layers';
import { makeSlab } from './slab';
import { ROOMS } from '../rooms/index';
import { createMaterialKit } from '../rooms/shell';
import { PROPS } from '../rooms/props/index';
import type { LayerConfig, RoomContext, RoomInstance } from '@/config/types';

/** Layer i (0 = top) rests at this height in the closed stack. */
export function restY(i: number, n: number): number {
  return STACK_BASE_Y + (n - 1 - i) * SLAB_T;
}

export interface Stack {
  group: THREE.Group;
  slabs: THREE.Object3D[];
  rooms: Array<RoomInstance & { layerIndex: number }>;
}

export function createStack(layers: LayerConfig[] = LAYERS): Stack {
  const group = new THREE.Group();
  group.name = 'stack';
  const mat = createMaterialKit();
  const slabs: THREE.Object3D[] = [];
  const rooms: Array<RoomInstance & { layerIndex: number }> = [];
  layers.forEach((layer, i) => {
    const slab = makeSlab(layer);
    slab.position.y = restY(i, layers.length);
    slab.userData.layerId = layer.id;
    group.add(slab);
    slabs.push(slab);

    // Mount the room on the slab top when the registry has one for it.
    const build = ROOMS[layer.room];
    if (build) {
      const ctx: RoomContext = { footprint: FOOTPRINT, wallH: WALL_H, mat, props: PROPS };
      const room = build(ctx);
      room.group.position.y = SLAB_T / 2 + 0.036;
      room.group.userData.layerId = layer.id;
      slab.add(room.group);
      rooms.push({ ...room, layerIndex: i });
    }
  });
  return { group, slabs, rooms };
}
