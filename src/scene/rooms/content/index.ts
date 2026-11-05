/** @module scene/rooms/content: the writing studio on the top slab; template for every room. @see docs/ROOMS.md (1 content), README.md (in this folder) */
import * as THREE from 'three';
import type { RoomBuilder } from '@/config/types';
import { buildShell, disposeObject } from '../shell.ts';
import { buildLayout } from './layout';
import { createAnim } from './anim';

export const build: RoomBuilder = (ctx) => {
  const group = new THREE.Group();
  group.name = 'room-content';

  group.add(buildShell(ctx));
  buildLayout(ctx, group);
  const anim = createAnim(group);

  return {
    group,
    update: anim.update,
    dispose() {
      anim.dispose();
      disposeObject(group);
    },
  };
};
