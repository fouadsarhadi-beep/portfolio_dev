// Smoke test on the built output. Usage: npm run build && npm run smoke
// Fails (exit 1) when a shipped artefact a visitor depends on is missing.
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const checks = [];
const ok = (name, pass, detail = '') => checks.push({ name, pass, detail });
const exists = (p) => fs.existsSync(path.join(DIST, p));
const read = (p) => fs.readFileSync(path.join(DIST, p), 'utf8');
const count = (p, needle) => (read(p).match(new RegExp(needle, 'g')) || []).length;

if (!exists('index.html')) {
  console.error('dist/index.html is missing. Run: npm run build');
  process.exit(1);
}

ok('home page ships', exists('index.html'));
ok('six ladder rungs', count('index.html', 'ladder-rung') === 6, `${count('index.html', 'ladder-rung')} found`);
ok('stage guides ship', count('index.html', 'stage-guide') >= 2);
ok('404 page ships', exists('404.html'));
ok('robots.txt ships', exists('robots.txt'));
ok('sitemap.xml ships', exists('sitemap.xml'));
ok('sitemap lists the home route', exists('sitemap.xml') && read('sitemap.xml').includes('<loc>'));

const layers = ['content', 'translation', 'seo', 'web-design-development', 'cms', 'infrastructure'];
for (const id of layers) {
  ok(`work page: ${id}`, exists(`work/${id}/index.html`));
  ok(`og card: ${id}`, exists(`og/${id}.svg`));
  ok(`samples json: ${id}`, exists(`work/${id}/samples/0.json`));
}
ok('content has a second samples page', exists('work/content/samples/1.json'));

const failed = checks.filter((c) => !c.pass);
for (const c of checks) console.log(`${c.pass ? 'ok  ' : 'FAIL'} ${c.name}${c.detail ? ` (${c.detail})` : ''}`);
if (failed.length) {
  console.error(`\n${failed.length} smoke check(s) failed.`);
  process.exit(1);
}
console.log(`\nSmoke OK: ${checks.length} checks.`);