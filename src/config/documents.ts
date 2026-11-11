/** @module config/documents: text of each sample document, keyed by Sample.doc. @cap-exempt: pure placeholder data, one entry per Sample.doc key; the one long-form body lives in src/config/articles.ts so this file stays a flat key-value table. @see src/config/layers.ts, src/ui/doc-viewer.ts, docs/DESIGN.md (Document reader) */
import type { SampleDocument } from './types';

/**
 * Placeholder copy in the register of docs/COPY.md. A sheet keeps its header in
 * the first row. `src` stays empty until a real file exists; the reader then
 * shows an "open the original" link.
 */
export const DOCUMENTS: Record<string, SampleDocument> = {
  // Long-form bodies live in src/config/articles.ts, so both data files stay
  // small. The reader resolves a key against that map first (src/ui/doc-viewer.ts).
  'content-3': {
    kind: 'sheet',
    meta: 'Sheet · 5 rows',
    rows: [
      ['Day', 'Subject', 'Goal'],
      ['0', 'Your account is ready', 'Sign in'],
      ['1', 'Set your first project', 'Create one project'],
      ['3', 'Invite the team', 'Add two people'],
      ['7', 'What the reports show', 'Open a report'],
    ],
  },
  'content-4': {
    kind: 'pdf',
    meta: '6 pages',
    text: [
      'Six customers, one page each. Every story follows the same order: the problem in their words, what we changed, the number that moved.',
      'Quotes come from recorded calls. The customer approves the page before it ships.',
    ],
  },
  'content-5': {
    kind: 'doc',
    meta: '31 articles',
    text: [
      'The help center answered in the language of the product. Support tags showed the words customers actually typed.',
      'Every article now opens with the search term, then the fix in three steps. The old pages redirect.',
    ],
  },
  'content-6': {
    kind: 'doc',
    meta: '4 rules',
    text: [
      'Four rules. Write the verb, not the noun. Say the number. Name the owner. Cut the sentence that only warms up.',
      'Each rule carries two examples: one from a page that works, one from a page we rewrote.',
    ],
  },
  'content-7': {
    kind: 'sheet',
    meta: 'Sheet · 4 rows',
    rows: [
      ['Month', 'Topic', 'Search demand', 'Owner'],
      ['Jan', 'Onboarding checklist', '1.2k', 'F. S.'],
      ['Feb', 'Pricing questions', '900', 'F. S.'],
      ['Mar', 'Migration guide', '480', 'F. S.'],
    ],
  },
  'content-8': {
    kind: 'doc',
    meta: '2 variants',
    text: [
      'Two variants for one campaign. Variant A leads with the outcome, variant B with the price.',
      'Both ran three weeks at an even split. The report that ships with the page names the winner.',
    ],
  },
  'content-9': {
    kind: 'pdf',
    meta: '12 pages',
    text: [
      'Nine names, each checked for meaning in English and Persian, then for trademark conflict and domain availability.',
      'The shortlist keeps three: one plain, one compound, one that survives translation without a footnote.',
    ],
  },
  'content-10': {
    kind: 'doc',
    meta: '180 words',
    text: [
      'The note went from nine links to one idea and one action. The opening line says why the reader should care this month.',
      'Each issue keeps a fixed length: 180 words, one image, one link.',
    ],
  },
  'content-11': {
    kind: 'sheet',
    meta: 'Sheet · 4 rows',
    rows: [
      ['URL', 'Traffic', 'Use', 'Decision'],
      ['/guides/onboarding', '4.1k', 'High', 'Keep and update'],
      ['/blog/2019-notes', '120', 'Low', 'Merge into guide'],
      ['/old-landing', '40', 'None', 'Cut'],
    ],
  },
  'content-12': {
    kind: 'sheet',
    meta: 'Sheet · 3 rows',
    rows: [
      ['Term', 'Definition', 'Where it shows'],
      ['Workspace', 'The container for one team and its projects', 'UI, docs'],
      ['Token', 'A key that lets a script call the API', 'Docs'],
      ['Run', 'One execution of a pipeline', 'UI, docs'],
    ],
  },
  'translation-1': {
    kind: 'doc',
    meta: 'Persian · 140 terms',
    text: [
      'The site shipped in English. The Persian build keeps the layout, the names and the promise, and changes what the language requires.',
      'A glossary holds the decisions. Localization QA reads both versions side by side before release.',
    ],
  },
  'translation-2': {
    kind: 'pdf',
    meta: '220 pages',
    text: [
      'Four manuals translated with the term list attached to the file. Every instance of a defined term uses the same word.',
      'Reviewers work inside the CAT tool, so comments and segments stay together.',
    ],
  },
  'translation-3': {
    kind: 'sheet',
    meta: 'Sheet · 4 rows',
    rows: [
      ['English', 'Persian', 'Note'],
      ['Workspace', 'فضای کاری', 'UI and docs'],
      ['Token', 'توکن', 'Docs only'],
      ['Deploy', 'استقرار', 'Button label'],
      ['Queue', 'صف', 'Infra term, keep English in code'],
    ],
  },
  'seo-1': {
    kind: 'pdf',
    meta: '14 pages',
    text: [
      'The audit covers crawl, index and speed. Each finding lists the page, the evidence and the fix.',
      'Fixes shipped in three passes. Search Console shows the reindex date of each pass.',
    ],
  },
  'seo-2': {
    kind: 'sheet',
    meta: 'Sheet · 3 rows',
    rows: [
      ['Cluster', 'Page', 'Primary term', 'Volume'],
      ['Onboarding', '/guides/onboarding', 'onboarding checklist', '1.2k'],
      ['Pricing', '/pricing', 'cms pricing', '720'],
    ],
  },
  'seo-3': {
    kind: 'doc',
    meta: 'Before / after report',
    text: [
      'The ten heaviest pages lost their render-blocking scripts, their un-sized images and their third-party fonts. Largest Contentful Paint moved from 4.1s to 1.8s.',
      'Each fix lists the file, the change and the measured result, so the next audit starts from the numbers.',
    ],
  },
  'web-design-development-1': {
    kind: 'doc',
    meta: 'Type and color',
    text: [
      'The type scale starts at 12px and doubles twice. One grid holds every section, and the spacing tokens come from the same scale.',
      'Color lives in eight roles. Each role maps to a light and a dark value, so a theme switch needs no new component.',
    ],
  },
  'web-design-development-2': {
    kind: 'pdf',
    meta: '8 pages',
    text: [
      'An interactive viewer for one product, built on WebGL with a fixed camera. It runs on phones at 30 frames per second with the pixel ratio capped.',
      'The model ships as a compressed mesh. Text and buttons stay in the DOM, so the page works without the scene.',
    ],
  },
  'web-design-development-3': {
    kind: 'doc',
    meta: 'Tokens and components',
    text: [
      'One token file holds color, spacing and type as names, and every component reads from it. A new brand is a new token file, not a new component.',
      'The docs show each component with its states, so a designer and a developer hand off the same picture.',
    ],
  },
  'cms-1': {
    kind: 'doc',
    meta: 'Blocks and fields',
    text: [
      'The theme uses a block for every section, so editors build pages without code. Fields are named for the editor, not for the template.',
      'Two post types ship: page and project. Both keep the same field order.',
    ],
  },
  'cms-2': {
    kind: 'sheet',
    meta: 'Sheet · 3 rows',
    rows: [
      ['Step', 'Setting', 'Note'],
      ['Products', 'Variants, two attributes', 'Size and color'],
      ['Payments', 'Card and invoice', 'Invoice for schools'],
    ],
  },
  'cms-3': {
    kind: 'doc',
    meta: '6 custom blocks',
    text: [
      'Six Gutenberg blocks cover every page layout: hero, text, gallery, quote, form and footer. Editors combine them without breaking the grid.',
      'Each block locks the fields editors should not change and frees the ones they should. A short training video ships with the theme.',
    ],
  },
  'infrastructure-1': {
    kind: 'sheet',
    meta: 'Sheet · 3 rows',
    rows: [
      ['Item', 'Before', 'After'],
      ['DNS', 'Registrar default', 'Cloudflare, proxied'],
      ['Mail', 'Same host', 'Split to mail provider'],
    ],
  },
  'infrastructure-2': {
    kind: 'doc',
    meta: 'Backup plan',
    text: [
      'Backups run nightly and stay for thirty days. A restore test runs on the first Monday of each month.',
      'Monitoring checks the home page, the checkout and the API every minute from two regions. Alerts go to mail and phone.',
    ],
  },
  'infrastructure-3': {
    kind: 'sheet',
    meta: 'Sheet · 4 rows',
    rows: [
      ['Step', 'Record', 'Result'],
      ['Domain', 'A record to the CDN', 'Site loads over HTTPS'],
      ['DNS', 'MX and SPF moved first', 'Mail kept working'],
      ['SSL', 'Full (strict) mode', 'No mixed content'],
      ['Cutover', 'TTL lowered 48h before', 'Zero downtime'],
    ],
  },
};