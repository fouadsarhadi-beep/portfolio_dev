/** @module pages/sitemap.xml: one entry per route, generated from LAYERS. @see src/pages/robots.txt.ts, src/config/layers.ts, src/config/site.ts */

import { LAYERS } from '@/config/layers';
import { SITE } from '@/config/site';

/** The sitemap is derived from the same config the routes are, so it cannot drift. */
export const GET = (): Response => {
  const routes = ['/', ...LAYERS.map((layer) => `/work/${layer.id}/`)];
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...routes.map((route) => `  <url><loc>${SITE.url}${route}</loc></url>`),
    '</urlset>',
    '',
  ].join('\n');
  return new Response(body, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
};