/** @module config/site: person, links and availability in one place. @see docs/COPY.md, src/content/en.ts */

// Placeholder identity and handles. Change them here only.
export const SITE = {
  name: 'Alex Morgan',
  role: 'Web Generalist',
  email: 'alex@example.com',
  available: true,
  socials: [
    { label: 'GitHub', href: 'https://github.com/alexmorgan' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/alexmorgan' },
    { label: 'Mastodon', href: 'https://mastodon.social/@alexmorgan' },
  ],
} as const;
