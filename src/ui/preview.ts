/** @module ui/preview: the floor info panel: the old right-hand stage guide merged into the hover card (T39). It names the floor the scroll is on, and swaps to any hovered or keyboard-selected floor. @see src/sections/Hero.astro, src/lib/bus.ts, src/styles/hud.css (.layer-card) */
import { bus } from '@/lib/bus';
import { LAYERS } from '@/config/layers';

let card: HTMLElement | null = null;
let step = 0;                      // the floor the scroll is on
let hoverId: string | null = null; // a hovered (or selected) floor wins while it lasts
let detail = false;                // the expanded view owns the stage

export function initPreview(): void {
  const host = document.querySelector<HTMLElement>('.stage-sticky');
  if (!host || card) return;

  // One card in the layer-nav column (the old stage-guide--right spot). It never
  // follows the slab and never carries a second "view work" control (clicking
  // the floor opens details). aria-hidden: the layer-nav buttons carry the
  // semantics, the ladder announces the step.
  const el = document.createElement('aside');
  el.className = 'layer-card';
  el.dataset.show = 'false';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `
    <p class="lc-count"><span data-lc-num></span><span class="lc-of">/ ${String(LAYERS.length).padStart(2, '0')}</span></p>
    <p class="lc-title" data-lc-title></p>
    <p class="lc-short" data-lc-short></p>
    <p class="lc-note" data-lc-note></p>`;
  host.appendChild(el);
  card = el;

  // Hover (pointer or touch preview) and keyboard selection both win over the
  // scroll's floor; when they end, the panel returns to the scroll's floor.
  bus.on('layer:hover', ({ id }) => {
    hoverId = id;
    sync();
  });
  bus.on('layer:select', ({ id }) => {
    hoverId = id;
    sync();
  });
  bus.on('step:change', ({ step: s }) => {
    step = s;
    sync();
  });
  // While the detail view is open (or closing) the panel stays out of the way;
  // on close it comes back with the floor the scroll is on.
  bus.on('layer:open', () => {
    detail = true;
    hide();
  });
  bus.on('layer:close', () => {
    detail = false;
    sync();
  });

  // Seed the scroll's floor: a scrolled reload can emit step:change before this
  // listener registers, and __stack is already published by then (boot.ts).
  const debug = (window as unknown as Record<string, unknown>).__stack as { step?: number } | null;
  step = typeof debug?.step === 'number' ? debug.step : 0;

  sync(); // the panel is always on once the UI wires up: it names the scroll's floor
}

/** The hovered floor wins; otherwise the panel names the floor the scroll is on. */
function sync(): void {
  if (detail || !card) {
    hide();
    return;
  }
  const id = hoverId ?? LAYERS[Math.min(step, LAYERS.length - 1)]?.id;
  const layer = LAYERS.find((l) => l.id === id);
  if (!layer) {
    hide();
    return;
  }
  (card.querySelector('[data-lc-num]') as HTMLElement).textContent = layer.number;
  (card.querySelector('[data-lc-title]') as HTMLElement).textContent = layer.title;
  (card.querySelector('[data-lc-short]') as HTMLElement).textContent = layer.short;
  (card.querySelector('[data-lc-note]') as HTMLElement).textContent = layer.intro;
  card.style.setProperty('--layer-c', `var(--c-${layer.color})`);
  card.dataset.show = 'true';
}

function hide(): void {
  if (card) card.dataset.show = 'false';
}
