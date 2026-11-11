/** @module config/site: person, links and availability in one place. @see docs/COPY.md, src/content/en.ts */

// Identity and handles. Change them here only.
export const SITE = {
  name: 'Fouad Sarhadi',
  role: 'Web Generalist',
  email: 'fouad@example.com',
  /** The deployed origin, used by robots.txt and sitemap.xml. Change on launch. */
  url: 'https://example.com',
  available: true,
  socials: [
    { label: 'GitHub', href: 'https://github.com/fouadsarhadi-beep' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/fouadsarhadi' },
    { label: 'Mastodon', href: 'https://mastodon.social/@fouadsarhadi' },
  ],
} as const;
