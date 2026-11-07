/** @module content/en: every English UI string, read through t(). @see src/lib/i18n.ts, docs/COPY.md */

// All UI text lives here and is read through t() (locked decision).
// Strings from docs/COPY.md are verbatim; headings and hints are placeholder copy.
export const en = {
  nf: {
    title: 'This page is not here',
    line: 'The stack is one page. Try a floor instead.',
    home: 'Back to the stack',
  },
  nav: {
    stack: 'Stack',
    toolkit: 'Toolkit',
    about: 'About',
    contact: 'Contact',
  },
  ladder: {
    label: 'Floors',
  },
  guide: {
    kicker: 'Floors 01 to 06',
    line: 'Each floor is one part of the job, stacked by craft.',
    hint: 'Click a floor to read its samples',
    skip: 'Simple view',
  },
  hero: {
    h1: 'I build websites from the server up to the sentence.',
    sub: 'Alex Morgan is a web generalist. Scroll to take the stack apart and see each layer.',
    hint: 'Scroll to lift the layers.',
  },
  about: {
    heading: 'About',
    body: 'I work across the systems that make a website function: the hosting, the editing setup, the interface, the design, the search setup and the words. I started with content and followed each problem down a layer.',
  },
  toolkit: {
    heading: 'Toolkit',
    intro: 'One tile per layer. The tools I reach for most.',
  },
  contact: {
    copyEmail: 'Copy email',
    copied: 'Copied',
    heading: 'Have a site to build, fix or rank?',
    body: 'Tell me what the site should do. I answer within two working days.',
    emailButton: 'Send email',
    availability: 'Open for projects.',
  },
  preview: {
    viewWork: 'View work',
  },
  detail: {
    back: 'Back to the stack',
    introHeading: 'Intro',
    capabilitiesHeading: 'What I do',
    samplesHeading: 'Sample work',
    samplesPage: 'Sample work page',
    samplesPrev: 'Previous samples',
    samplesNext: 'More samples',
    docOpen: 'Read the document',
    docClose: 'Close document',
    docOriginal: 'Open the original file',
    docEmpty: 'This document has no text yet.',
    toolkitHeading: 'Toolkit',
  },
  hud: {
    progressLabel: 'Scroll progress',
    layerNavLabel: 'Stack layers',
  },
  a11y: {
    skipToContent: 'Skip to content',
    openLayer: 'Open layer',
    close: 'Close',
    themeToggle: 'Toggle color theme',
  },
  footer: {
    note: 'Built as one page and six layers.',
  },
} as const;

export type Dict = typeof en;
