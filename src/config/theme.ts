/** @module config/theme: the light and dark palettes as semantic roles, shared by CSS and the scene. @see docs/DESIGN.md (Dual theme), src/styles/tokens.css */

export type ThemeName = 'light' | 'dark';

/** Semantic color roles. CSS variables mirror these names in tokens.css. */
export interface ThemeColors {
  bg: string;
  bgGlow: string;
  surface: string;
  surfaceAlt: string;
  elevated: string;
  line: string;
  ink: string;
  inkSoft: string;
  inkMuted: string;
  accent: string;
  accent2: string;
  highlight: string;
  wall: string;
  wallShade: string;
  wood: string;
  woodDark: string;
  white: string;
  graphite: string;
  glow: string;
  ledGreen: string;
  ledAmber: string;
  ledRed: string;
  /** Layer accents by LayerConfig.id; must stay distinguishable in both themes. */
  layerAccents: Record<string, string>;
}

import { LIGHT, DARK } from './palette';

export { LIGHT, DARK };

export const THEMES: Record<ThemeName, ThemeColors> = { light: LIGHT, dark: DARK };
