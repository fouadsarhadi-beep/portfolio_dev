# T02 Page shell (no 3D yet)
Goal: the full page works as plain HTML. Scroll reaches every section. Works with JavaScript off.
Read first: AGENTS.md, docs/DESIGN.md (Type, HUD and UI style, Sections), docs/MOTION.md (Scroll mapping), src/config/*.
Files: src/layouts/Base.astro, src/sections/Hud.astro, Hero.astro, About.astro, Toolkit.astro, Contact.astro, Footer.astro, src/pages/index.astro, src/pages/work/[layer].astro, src/styles/tokens.css, base.css, hud.css, sections.css.
Steps
1. tokens.css holds the palette as CSS variables and the type scale. base.css loads the fonts and resets.
2. Hero.astro: `#stage` with height per MOTION.md and a sticky 100svh child. Inside: a `<div id="canvas-mount">`, a poster `<img>` placeholder, a `<ul class="layer-nav">` with one real button per layer, and the H1 and sub from COPY.md.
3. Without JavaScript the seven layers show as `<article>` blocks (number, title, short line, link to /work/<id>).
4. About, Toolkit, Contact, Footer per DESIGN.md Sections. All text through `t()` or config.
5. work/[layer].astro: getStaticPaths from config. Shows the layer's full content and a back link.
6. Base.astro: title, description, Open Graph tags, JSON-LD Person.
Done when
- `npm run build` outputs /, and /work/<id> for all seven layers.
- With JavaScript disabled, all content is visible and the page scrolls to Contact.
- Layout holds at 360px and 1440px.
Do not touch: scene/, ui/.
