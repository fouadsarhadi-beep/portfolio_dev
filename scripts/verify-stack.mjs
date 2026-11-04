// Verifies the stack motion against docs/MOTION.md Debug checks. Needs the dev server running.
// Usage: node scripts/verify-stack.mjs   (URL env var overrides http://localhost:4321/)
import { chromium } from 'playwright';

const url = process.env.URL || 'http://127.0.0.1:4321/';
const LIFT = 8.2; // src/config/tuning.ts (locked geometry)
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

// wait for the debug state to exist, then derive the layer count from config
let stack = null;
for (let i = 0; i < 60 && !stack; i++) {
  await page.waitForTimeout(500);
  stack = await readStack(page);
}
if (!stack) { fail('window.__stack never appeared'); process.exit(1); }
const N = stack.ids.length;
const STEPS = N - 1;
const range = await page.evaluate(() => {
  const el = document.querySelector('.stage');
  return el ? el.offsetHeight - innerHeight : 0;
});
console.log(`config: ${N} layers, ${STEPS} steps`);

// 1. s = 0: all u are 0, only layer 0 has e = 1.
await page.evaluate((y) => scrollTo(0, y), 0);
await page.waitForTimeout(2600);
stack = await readStack(page);
if (stack.step !== 0) fail(`step ${stack.step} at s=0, want 0`);
if (stack.u.some((v) => Math.abs(v) > EPS)) fail('some u are not 0 at s=0: ' + JSON.stringify(stack.u));
else ok('s=0: step 0, all u = 0');
if (Math.abs(stack.e[0] - 1) > EPS || stack.e.slice(1).some((v) => v > EPS)) fail('e wrong at s=0: ' + JSON.stringify(stack.e));
else ok('s=0: only layer 0 has e = 1');

// 2. mid: s = 0.5 x STEPS (half the layers lifted, middle layer exposed)
await page.evaluate((y) => scrollTo(0, y), Math.round(range * 0.5));
await page.waitForTimeout(3200);
stack = await readStack(page);
const mid = Math.round(STEPS / 2);
if (stack.step !== mid) fail(`step ${stack.step} at s=${mid}, want ${mid}`);
const liftedMid = stack.u.slice(0, mid).every((v) => Math.abs(v - LIFT) < EPS) && stack.u.slice(mid).every((v) => v < EPS);
liftedMid ? ok(`s=${mid}: u[0..${mid - 1}] = LIFT, rest = 0`) : fail('u wrong at mid: ' + JSON.stringify(stack.u));
Math.abs(stack.e[mid] - 1) < EPS ? ok(`s=${mid}: layer ${mid} exposed`) : fail('e wrong at mid: ' + JSON.stringify(stack.e));

// 3. s = STEPS
await page.evaluate((y) => scrollTo(0, y), range);
await page.waitForTimeout(3200);
stack = await readStack(page);
if (stack.step !== STEPS) fail(`step ${stack.step} at s=${STEPS}, want ${STEPS}`);
const liftedAll = stack.u.slice(0, STEPS).every((v) => Math.abs(v - LIFT) < EPS) && Math.abs(stack.u[STEPS]) < EPS;
liftedAll ? ok(`s=${STEPS}: u[0..${STEPS - 1}] = LIFT, u[${STEPS}] = 0`) : fail('u wrong at full lift: ' + JSON.stringify(stack.u));
Math.abs(stack.e[STEPS] - 1) < EPS ? ok(`s=${STEPS}: layer ${STEPS} exposed`) : fail('e wrong at full lift: ' + JSON.stringify(stack.e));

// 4. fast jump back to 0: invariant must hold during the whole slam.
await page.evaluate((y) => scrollTo(0, y), 0);
let samples = 0, bad = 0;
for (let i = 0; i < 40; i++) {
  const s = await readStack(page);
  if (s) {
    samples++;
    for (let k = 0; k < N - 1; k++) {
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
