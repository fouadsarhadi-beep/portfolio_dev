// Verifies the stack motion against docs/MOTION.md Debug checks. Needs the dev server running.
// Usage: node scripts/verify-stack.mjs   (URL env var overrides http://localhost:4321/)
import { chromium } from 'playwright';

const url = process.env.URL || 'http://127.0.0.1:4321/';
const LIFT = 8.2;
const EPS = 0.05;
let failures = 0;

const fail = (msg) => { failures++; console.error('FAIL ' + msg); };
const ok = (msg) => console.log('ok   ' + msg);

async function readStack(page) {
  return page.evaluate(() => window.__stack && JSON.parse(JSON.stringify(window.__stack)));
}

const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('pageerror', (e) => fail('pageerror: ' + e));
await page.goto(url, { waitUntil: 'networkidle' });

// wait for the debug state to exist
let stack = null;
for (let i = 0; i < 60 && !stack; i++) {
  await page.waitForTimeout(500);
  stack = await readStack(page);
}
if (!stack) { fail('window.__stack never appeared'); process.exit(1); }
const range = await page.evaluate(() => {
  const el = document.querySelector('.stage');
  return el ? el.offsetHeight - innerHeight : 0;
});

// 1. s = 0: all u are 0, only layer 0 has e = 1.
await page.evaluate((y) => scrollTo(0, y), 0);
await page.waitForTimeout(2600);
stack = await readStack(page);
if (stack.step !== 0) fail(`step ${stack.step} at s=0, want 0`);
if (stack.u.some((v) => Math.abs(v) > EPS)) fail('some u are not 0 at s=0: ' + JSON.stringify(stack.u));
else ok('s=0: step 0, all u = 0');
if (Math.abs(stack.e[0] - 1) > EPS || stack.e.slice(1).some((v) => v > EPS)) fail('e wrong at s=0: ' + JSON.stringify(stack.e));
else ok('s=0: only layer 0 has e = 1');

// 2. mid: s = 0.5 x STEPS
await page.evaluate((y) => scrollTo(0, y), Math.round(range * 0.5));
await page.waitForTimeout(3200);
stack = await readStack(page);
if (stack.step !== 3) fail(`step ${stack.step} at s=3, want 3`);
const liftedMid = stack.u.slice(0, 3).every((v) => Math.abs(v - LIFT) < EPS) && stack.u.slice(3).every((v) => v < EPS);
liftedMid ? ok('s=3: u[0..2] = LIFT, u[3..6] = 0') : fail('u wrong at s=3: ' + JSON.stringify(stack.u));
Math.abs(stack.e[3] - 1) < EPS ? ok('s=3: layer 3 exposed') : fail('e wrong at s=3: ' + JSON.stringify(stack.e));

// 3. s = STEPS
await page.evaluate((y) => scrollTo(0, y), range);
await page.waitForTimeout(3200);
stack = await readStack(page);
if (stack.step !== 6) fail(`step ${stack.step} at s=6, want 6`);
const liftedAll = stack.u.slice(0, 6).every((v) => Math.abs(v - LIFT) < EPS) && Math.abs(stack.u[6]) < EPS;
liftedAll ? ok('s=6: u[0..5] = LIFT, u[6] = 0') : fail('u wrong at s=6: ' + JSON.stringify(stack.u));
Math.abs(stack.e[6] - 1) < EPS ? ok('s=6: layer 6 exposed') : fail('e wrong at s=6: ' + JSON.stringify(stack.e));

// 4. fast jump back to 0: invariant must hold during the whole slam.
await page.evaluate((y) => scrollTo(0, y), 0);
let samples = 0, bad = 0;
for (let i = 0; i < 40; i++) {
  const s = await readStack(page);
  if (s) {
    samples++;
    for (let k = 0; k < 6; k++) {
      if (s.u[k] < s.u[k + 1] - 1e-4) { bad++; break; }
    }
  }
  await page.waitForTimeout(50);
}
await page.waitForTimeout(2500);
stack = await readStack(page);
bad === 0 ? ok(`invariant u[i] >= u[i+1] held in ${samples} samples during fast jump`) : fail(`invariant violated in ${bad}/${samples} samples`);
if (stack.step !== 0) fail(`step ${stack.step} after jump to 0, want 0`);
if (stack.u.some((v) => Math.abs(v) > EPS)) fail('some u are not 0 after restack: ' + JSON.stringify(stack.u));
else ok('restack: all u back to 0');

await browser.close();
if (failures) { console.error(`\n${failures} failure(s).`); process.exit(1); }
console.log('\nPASS: stack motion matches docs/MOTION.md checks.');
