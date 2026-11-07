/** @module pages/robots.txt: crawl everything, point at the sitemap. @see src/pages/sitemap.xml.ts, src/config/site.ts */

import { SITE } from '@/config/site';

export const GET = (): Response =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });