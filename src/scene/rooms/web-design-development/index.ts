/** @module scene/rooms/web-design-development: the merged design-and-development workspace on layer 4. @see docs/ROOMS.md (4), README.md (in this folder) */
import * as THREE from 'three';
import type { RoomBuilder } from '@/config/types';
import { buildShell, disposeObject } from '../shell.ts';
import { buildLayout, type WddHandles } from './layout';
import { createAnim } from './anim';

export const build: RoomBuilder = (ctx) => {
  const group = new THREE.Group();
  group.name = 'room-web-design-development';

  group.add(buildShell(ctx));
  const handles = buildLayout(ctx, group);
  const anim = createAnim(group, handles);

  return {
    group,
    update: anim.update,
    dispose() {
      anim.dispose();
      disposeObject(group);
    },
  };
};
