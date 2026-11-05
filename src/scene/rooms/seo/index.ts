/** @module scene/rooms/seo: the analytics command center on layer 3. @see docs/ROOMS.md (3 seo), README.md (in this folder) */
import * as THREE from 'three';
import type { RoomBuilder } from '@/config/types';
import { buildShell, disposeObject } from '../shell.ts';
import { buildLayout } from './layout';
import { createAnim } from './anim';

export const build: RoomBuilder = (ctx) => {
  const group = new THREE.Group();
  group.name = 'room-seo';

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
