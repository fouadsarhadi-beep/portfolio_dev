/** @module scene/rooms/cms: the publishing studio on layer 6. @see docs/ROOMS.md (6 cms), README.md (in this folder) */
import * as THREE from 'three';
import type { RoomBuilder } from '@/config/types';
import { buildShell, disposeObject } from '../shell.ts';
import { buildLayout, type CmsHandles } from './layout';
import { createAnim } from './anim';

export const build: RoomBuilder = (ctx) => {
  const group = new THREE.Group();
  group.name = 'room-cms';

  group.add(buildShell(ctx));
  const handles = buildLayout(ctx, group);
  const anim = createAnim(handles);

  return {
    group,
    update: anim.update,
    dispose() {
      anim.dispose();
      disposeObject(group);
    },
  };
};
