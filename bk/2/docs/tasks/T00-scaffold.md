# T00 Scaffold
Goal: an empty Astro + TypeScript project that runs, builds and passes the checks.
Read first: AGENTS.md (Locked decisions, Folder map).
Files: package.json, astro.config.mjs, tsconfig.json, src/pages/index.astro (placeholder), .gitignore.
Steps
1. Create an Astro project in this folder (minimal template, TypeScript strict). Keep AGENTS.md, docs/ and scripts/ as they are.
2. Install: three, gsap, @fontsource-variable/fredoka, @fontsource-variable/dm-sans. Dev: typescript, @types/three, playwright (optional, for shots).
3. Add path alias `@/*` -> `src/*` in tsconfig.json.
4. Add scripts to package.json: `"check": "tsc --noEmit && node scripts/check.mjs"`, `"map": "node scripts/check.mjs --map-only"`, `"shots": "node scripts/shots.mjs"`.
5. Give src/pages/index.astro the required header comment. Run `npm run map`.
Done when
- `npm run dev` serves a page. `npm run build` succeeds. `npm run check` passes. docs/MAP.md exists.
Do not touch: docs/*.md except PROGRESS.md.
