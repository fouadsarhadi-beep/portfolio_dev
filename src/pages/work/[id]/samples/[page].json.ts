/** @module pages/work/[id]/samples/[page].json: static sample pages for the detail pager. @see src/ui/detail-samples.ts, src/config/detail.ts, src/config/layers.ts */
import type { APIRoute } from 'astro';
import { SAMPLE_PAGE } from '@/config/detail';
import { LAYERS } from '@/config/layers';
import type { Sample } from '@/config/types';

/**
 * One JSON file per layer per page, so the pager can fetch a page without a
 * server: /work/<id>/samples/<page>.json. A static host has no query strings,
 * which is why the page number is a path segment.
 */
export function getStaticPaths() {
  return LAYERS.flatMap((layer) =>
    Array.from({ length: Math.max(1, Math.ceil(layer.samples.length / SAMPLE_PAGE)) }, (_, page) => ({
      params: { id: layer.id, page: String(page) },
      props: { items: layer.samples.slice(page * SAMPLE_PAGE, (page + 1) * SAMPLE_PAGE) },
    })),
  );
}

export const GET: APIRoute = ({ props }) => {
  const items = (props as { items: Sample[] }).items;
  return new Response(JSON.stringify({ items }), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
};