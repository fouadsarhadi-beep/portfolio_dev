/** @module ui/preview: the hover info card; fixed spot on the right edge of the stage (T29). @see docs/MOTION.md (Pick, hover, touch), src/lib/bus.ts, src/styles/hud.css (.layer-card) */
import { bus } from '@/lib/bus';
import { LAYERS } from '@/config/layers';

let card: HTMLElement | null = null;
let currentId: string | null = null;

export function initPreview(): void {
  const host = document.querySelector<HTMLElement>('.stage-sticky');
  if (!host || card) return;

  // One card in a deliberate position; it never follows the slab and never
  // carries a second "view work" control (clicking the floor opens details).
  const el = document.createElement('aside');
  el.className = 'layer-card';
  el.dataset.show = 'false';
  el.setAttribute('aria-hidden', 'true'); // the layer-nav buttons carry the semantics
  el.innerHTML = `
    <p class="lc-kicker"><span class="lc-num" data-lc-num></span><span class="lc-title" data-lc-title></span></p>
    <p class="lc-short" data-lc-short></p>`;
  host.appendChild(el);
  card = el;

  bus.on('layer:hover', ({ id }) => {
    if (id) show(id);
    else hide();
  });
  bus.on('layer:select', ({ id }) => show(id));
  // While the detail view is open (or closing) the card stays out of the way.
  bus.on('layer:open', () => hide());
  bus.on('layer:close', () => hide());
}

function show(id: string): void {
  const layer = LAYERS.find((l) => l.id === id);
  if (!layer || !card) return;
  if (currentId !== id) {
    currentId = id;
    (card.querySelector('[data-lc-num]') as HTMLElement).textContent = layer.number;
    (card.querySelector('[data-lc-title]') as HTMLElement).textContent = layer.title;
    (card.querySelector('[data-lc-short]') as HTMLElement).textContent = layer.short;
    card.style.setProperty('--layer-c', `var(--c-${layer.color})`);
  }
  card.dataset.show = 'true';
}

function hide(): void {
  currentId = null;
  if (card) card.dataset.show = 'false';
}
