/** @module pages/og/[layer].svg: a per-floor social card, drawn from the theme. @see src/pages/work/[layer].astro, src/config/theme.ts, src/config/layers.ts */
import { THEMES } from '@/config/theme';
import { LAYERS } from '@/config/layers';
import type { LayerConfig } from '@/config/types';

export function getStaticPaths() {
  return LAYERS.map((l) => ({ params: { layer: l.id }, props: { layer: l } }));
}

interface Props { layer: LayerConfig }

/**
 * SVG keeps the card in the repo with no build step and no image service, and it
 * recolours from the palette (hex stays in config/theme.ts). Crawlers that only
 * accept raster images get nothing yet: swap this for a raster export when a
 * pipeline exists.
 */
export const GET = ({ props }: { props: Props }): Response => {
  const c = THEMES.dark;
  const accent = c.layerAccents[props.layer.id] ?? c.accent;
  const title = props.layer.title;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="${title}">
  <rect width="1200" height="630" fill="${c.bg}"/>
  <rect x="0" y="0" width="1200" height="8" fill="${accent}"/>
  <text x="80" y="150" fill="${c.inkSoft}" font-family="system-ui, sans-serif" font-size="44" letter-spacing="6">${props.layer.number}</text>
  <text x="80" y="330" fill="${c.ink}" font-family="system-ui, sans-serif" font-size="92" font-weight="600">${title}</text>
  <text x="80" y="410" fill="${c.inkSoft}" font-family="system-ui, sans-serif" font-size="34">${props.layer.short}</text>
  <rect x="80" y="470" width="220" height="6" rx="3" fill="${accent}"/>
</svg>`;
  return new Response(svg, { headers: { 'content-type': 'image/svg+xml; charset=utf-8' } });
};