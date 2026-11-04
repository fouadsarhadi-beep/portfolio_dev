// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Legacy layer URLs keep working after the design + frontend merge (T16).
  redirects: {
    '/work/design': '/work/web-design-development/',
    '/work/frontend': '/work/web-design-development/',
  },
});
