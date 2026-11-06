/** @module ui/detail-samples: work tiles for the expanded view: 3 across, 9 per page, slider pager. @see src/ui/detail.ts, src/config/detail.ts, src/config/sample-icons.ts, src/pages/work/[id]/samples/[page].json.ts */
import { SAMPLE_PAGE } from '@/config/detail';
import { SAMPLE_ICONS } from '@/config/sample-icons';
import type { LayerConfig, Sample } from '@/config/types';
import { t } from '@/lib/i18n';
import { openDocument } from './doc-viewer';

export interface SamplesView {
  /** Draws page one for this layer and sets up the pager if there is more than one page. */
  show(layer: LayerConfig): void;
}

/** Pages are fetched once and kept, so moving the slider back is instant. */
const cache = new Map<string, Sample[]>();

function samplesUrl(id: string, page: number): string {
  return `/work/${id}/samples/${page}.json`;
}

function glyph(sample: Sample, fallback: string): string {
  const inner = sample.icon ? SAMPLE_ICONS[sample.icon] : undefined;
  if (inner) {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
  }
  // No glyph named: fall back to the layer icon, a filled 24x24 path.
  return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="${fallback}"/></svg>`;
}

function tile(sample: Sample, fallbackIcon: string): string {
  // A sample with a document is a button: it opens the reader. Spans, not
  // block elements, so the markup stays valid inside a button.
  const openable = Boolean(sample.doc);
  const tag = openable ? 'button' : 'article';
  const attrs = openable
    ? ` type="button" data-doc="${sample.doc}" data-doc-title="${sample.title.replace(/"/g, '&quot;')}" aria-haspopup="dialog" aria-label="${t('detail.docOpen')}: ${sample.title}"`
    : '';
  return `<${tag} class="dv-sample"${attrs}>
    <span class="dv-sample-icon" aria-hidden="true">${glyph(sample, fallbackIcon)}</span>
    <span class="dv-sample-title">${sample.title}</span>
    <span class="dv-sample-blurb">${sample.blurb}</span>
  </${tag}>`;
}

export function createSamplesView(panel: HTMLElement): SamplesView {
  const row = panel.querySelector<HTMLElement>('[data-dv-samples]');
  const pager = panel.querySelector<HTMLElement>('[data-dv-pager]');
  const slider = pager?.querySelector<HTMLInputElement>('input[type="range"]') ?? null;
  const count = pager?.querySelector<HTMLElement>('.dv-pager-count') ?? null;
  const prev = pager?.querySelector<HTMLButtonElement>('[data-dv-prev]') ?? null;
  const next = pager?.querySelector<HTMLButtonElement>('[data-dv-next]') ?? null;

  let layer: LayerConfig | null = null;
  let page = 0;

  const totalPages = (): number =>
    layer ? Math.max(1, Math.ceil(layer.samples.length / SAMPLE_PAGE)) : 1;

  function paint(items: Sample[]): void {
    const current = layer;
    if (!row || !current) return;
    row.innerHTML = items.map((s) => tile(s, current.icon)).join('');
    if (count) count.textContent = `${page + 1} / ${totalPages()}`;
    if (prev) prev.disabled = page === 0;
    if (next) next.disabled = page >= totalPages() - 1;
    if (slider) slider.value = String(page);
  }

  /** Page one lives in the config; later pages come from a static JSON route. */
  async function go(target: number): Promise<void> {
    if (!layer) return;
    const last = totalPages() - 1;
    const wanted = Math.min(Math.max(target, 0), last);
    const key = `${layer.id}:${wanted}`;
    const cached = cache.get(key);
    const before = page;
    page = wanted;
    if (cached) {
      paint(cached);
      return;
    }
    if (wanted === 0) {
      const first = layer.samples.slice(0, SAMPLE_PAGE);
      cache.set(key, first);
      paint(first);
      return;
    }
    try {
      const res = await fetch(samplesUrl(layer.id, wanted), { headers: { accept: 'application/json' } });
      if (!res.ok) throw new Error(`samples ${res.status}`);
      const data = (await res.json()) as { items: Sample[] };
      cache.set(key, data.items);
      paint(data.items);
    } catch {
      page = before; // stay on the page that is already on screen
      paint(cache.get(`${layer.id}:${before}`) ?? layer.samples.slice(0, SAMPLE_PAGE));
    }
  }

  slider?.addEventListener('input', () => {
    if (count) count.textContent = `${Number(slider.value) + 1} / ${totalPages()}`;
  });
  slider?.addEventListener('change', () => void go(Number(slider.value)));
  prev?.addEventListener('click', () => void go(page - 1));
  next?.addEventListener('click', () => void go(page + 1));

  // One delegated listener, because the grid is re-rendered on every page change.
  row?.addEventListener('click', (e) => {
    const el = (e.target as Element).closest<HTMLElement>('[data-doc]');
    if (!el?.dataset.doc) return;
    openDocument(el.dataset.doc, el.dataset.docTitle ?? '', el);
  });

  return {
    show(nextLayer: LayerConfig): void {
      layer = nextLayer;
      page = 0;
      const last = totalPages() - 1;
      if (pager) pager.hidden = last === 0;
      if (slider) slider.max = String(last);
      void go(0);
    },
  };
}