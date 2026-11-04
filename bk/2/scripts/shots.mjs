// Screenshots at set scroll positions for visual review. Needs: npm i -D playwright && npx playwright install chromium
// Usage: start the dev server (npm run dev), then: npm run shots
import { chromium } from 'playwright';
import fs from 'fs';

const url = process.env.URL || 'http://localhost:4321/';
const stops = [0, 0.17, 0.34, 0.5, 0.67, 0.83, 1];
const sizes = [{ name: 'desktop', width: 1440, height: 900 }, { name: 'mobile', width: 390, height: 844 }];
fs.mkdirSync('shots', { recursive: true });
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
for (const s of sizes) {
  const page = await browser.newPage({ viewport: { width: s.width, height: s.height } });
  page.on('console', m => m.type() === 'error' && console.error(`[${s.name}] console error:`, m.text()));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const range = await page.evaluate(() => { const el = document.querySelector('#stage'); return el ? el.offsetHeight - innerHeight : 0; });
  for (const p of stops) {
    await page.evaluate(y => scrollTo(0, y), Math.round(range * p));
    await page.waitForTimeout(1800); // let the triggered animations finish
    await page.screenshot({ path: `shots/${s.name}-${String(Math.round(p * 100)).padStart(3, '0')}.png` });
  }
  await page.close();
}
await browser.close();
console.log('Screenshots saved in shots/. View them and list defects before you continue.');
