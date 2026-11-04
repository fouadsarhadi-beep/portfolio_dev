/** @module scene/rooms/index: room registry; keys match LayerConfig.room. @see docs/WIRING.md (How to add a layer), src/config/layers.ts */
import type { RoomBuilder } from '@/config/types';
import { build as content } from './content';
import { build as translation } from './translation';
import { build as seo } from './seo';
import { build as design } from './design';
import { build as frontend } from './frontend';
import { build as cms } from './cms';
import { build as infrastructure } from './infrastructure';

export const ROOMS: Record<string, RoomBuilder> = {
  content,
  translation,
  seo,
  design,
  frontend,
  cms,
  infrastructure,
};
