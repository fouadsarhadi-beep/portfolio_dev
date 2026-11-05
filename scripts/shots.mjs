// Screenshots at set scroll positions for visual review. Needs: npm i -D playwright && npx playwright install chromium
// Usage: start the dev server (npm run dev), then: npm run shots
// URL=http://localhost:4322/ npm run shots   (target another server)
// Env: SLAM=1 adds a mid-slam frame (dust puff); DARK=0 skips the dark-theme pass.
import { chromium } from 'playwright';
import fs from 'fs';

const url = process.env.URL || 'http://localhost:4321/';
const stops = [0, 0.17, 0.34, 0.5, 0.67, 0.83, 1];
const sizes = [{ name: 'desktop', width: 1440, height: 900 }, { name: 'mobile', width: 390, height: 844 }];
fs.mkdirSync('shots', { recursive: true });
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });

async function pass(name, { slam = false } = {}) {
  const theme = name.includes('-dark') ? 'dark' : 'light';
  const page = await browser.newPage({ viewport: { width: sizes.find((s) => s.name === name.split('-')[0]).width, height: sizes.find((s) => s.name === name.split('-')[0]).height } });
  page.on('console', m => m.type() === 'error' && console.error(`[${name}] console error:`, m.text()));
  if (theme === 'dark') {
    await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
  }
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const range = await page.evaluate(() => { const el = document.querySelector('.stage'); return el ? el.offsetHeight - innerHeight : 0; });
  for (const p of stops) {
    await page.evaluate(y => scrollTo(0, y), Math.round(range * p));
    await page.waitForTimeout(1800); // let the triggered animations finish
    await page.screenshot({ path: `shots/${name}-${String(Math.round(p * 100)).padStart(3, '0')}.png` });
    if (slam && p === 1) {
      // Jump back to the top and catch the slam mid-flight: lower layers land
      // 0.42s in, upper ones up to 0.7s; shoot between the two.
      await page.evaluate(() => scrollTo(0, 0));
      await page.waitForTimeout(560);
      await page.screenshot({ path: `shots/${name}-slam.png` });
    }
  }
  await page.close();
}

for (const s of sizes) {
  await pass(s.name, { slam: process.env.SLAM === '1' });
}
if (process.env.DARK !== '0') {
  await pass('desktop-dark');
  await pass('mobile-dark');
}
await browser.close();
console.log('Screenshots saved in shots/. View them and list defects before you continue.');
