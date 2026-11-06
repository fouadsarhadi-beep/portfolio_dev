/** @module config/sample-icons: stroked 24x24 glyphs for the sample work tiles. @see src/config/layers.ts, src/ui/detail-samples.ts, docs/DESIGN.md (Detail view) */

/**
 * Inner SVG markup per glyph name, drawn stroked in the layer accent color.
 * Samples name one of these; without a name the tile falls back to the layer
 * icon path (src/config/layers.ts), which is a filled 24x24 path.
 */
export const SAMPLE_ICONS: Record<string, string> = {
  doc: '<path d="M7 3h7l3 3v15H7z"/><path d="M14 3v4h3"/><path d="M9.5 11h6"/><path d="M9.5 15h6"/>',
  pen: '<path d="M4 20l1-4 11-11 3 3-11 11z"/><path d="M14 7l3 3"/>',
  globe: '<circle cx="12" cy="12" r="8"/><path d="M4 12h16"/><path d="M12 4c3.2 4.4 3.2 11.6 0 16"/>',
  chart: '<path d="M4 20V4"/><path d="M4 20h16"/><path d="M8 17v-5"/><path d="M13 17V9"/><path d="M18 17v-3"/>',
  cart: '<path d="M3 4h3l2.6 10h9.2L20 7H7"/><circle cx="9.5" cy="18.5" r="1.3"/><circle cx="17" cy="18.5" r="1.3"/>',
  code: '<path d="M9 7l-4 5 4 5"/><path d="M15 7l4 5-4 5"/>',
  server: '<rect x="4" y="4" width="16" height="6" rx="1.6"/><rect x="4" y="14" width="16" height="6" rx="1.6"/><path d="M8 7h.01"/><path d="M8 17h.01"/>',
  layout: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 10h16"/><path d="M10 10v10"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="M15.5 15.5L20 20"/>',
  bolt: '<path d="M13 3L5 14h5l-1 7 8-11h-5z"/>',
};