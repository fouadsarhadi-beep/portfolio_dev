/** @module ui/preview: the floor hover card: appears only while a floor is hovered or keyboard-selected, and names that floor. @see src/sections/Hero.astro, src/lib/bus.ts, src/styles/hud.css (.layer-card) */
import { bus } from '@/lib/bus';
import { layersView } from '@/lib/i18n';

let card: HTMLElement | null = null;
let hoverId: string | null = null; // a hovered (or selected) floor shows the card
let detail = false;                // the expanded view owns the stage

export function initPreview(): void {
  // The card lives in the stage's side column (src/sections/Hero.astro): the
  // column stacks it above the layer nav, so the two can never overlap.
  const host = document.querySelector<HTMLElement>('.stage-side')
    ?? document.querySelector<HTMLElement>('.stage-sticky');
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
    <p class="lc-count"><span data-lc-num></span><span class="lc-of">/ ${String(layersView().length).padStart(2, '0')}</span></p>
    <p class="lc-title" data-lc-title></p>
    <p class="lc-short" data-lc-short></p>
    <p class="lc-note" data-lc-note></p>`;
  host.prepend(el); // first child: the panel sits on top, the nav keeps the end edge
  card = el;

  // Hover (pointer or touch preview) and keyboard selection show the card for
  // that floor; when they end, the card hides. It is not an always-on panel.
  bus.on('layer:hover', ({ id }) => {
    hoverId = id;
    sync();
  });
  bus.on('layer:select', ({ id }) => {
    hoverId = id;
    sync();
  });
  bus.on('step:change', () => {
    // The scroll moved: a stale hover card must not linger over the new floor.
    if (!hoverId) sync();
  });
  // While the detail view is open (or closing) the card stays out of the way.
  bus.on('layer:open', () => {
    detail = true;
    hide();
  });
  bus.on('layer:close', () => {
    detail = false;
    hide();
  });
  // A live locale switch re-renders the card in the new language.
  bus.on('locale:change', () => sync());
}

/** The card shows only for a hovered (or keyboard-selected) floor. */
function sync(): void {
  if (detail || !card) {
    hide();
    return;
  }
  const layer = layersView().find((l) => l.id === hoverId);
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
