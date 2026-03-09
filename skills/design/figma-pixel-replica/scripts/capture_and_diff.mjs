#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    if (!argv[i].startsWith('--')) continue;
    const key = argv[i].slice(2);
    const val = argv[i + 1];
    if (!val || val.startsWith('--')) {
      args[key] = 'true';
      i -= 1;
      continue;
    }
    args[key] = val;
  }
  return args;
}

function ensureRequired(args, keys) {
  const missing = keys.filter((k) => !args[k]);
  if (missing.length > 0) {
    console.error(`Missing args: ${missing.join(', ')}`);
    console.error(
      'Usage: node scripts/capture_and_diff.mjs --url <url> --figma <png> --out <dir> --viewport <w>x<h> [--wait 1000] [--selector "#root"]',
    );
    process.exit(1);
  }
}

const args = parseArgs(process.argv);
ensureRequired(args, ['url', 'figma', 'out', 'viewport']);

const requireFromCwd = createRequire(`${process.cwd()}/`);
let chromium;
try {
  ({ chromium } = requireFromCwd('playwright'));
} catch {
  try {
    ({ chromium } = requireFromCwd('@playwright/test'));
  } catch {
    console.error('Cannot find Playwright from current workspace.');
    console.error('Install with: npm i -D playwright  (or run in a workspace that already has it)');
    process.exit(1);
  }
}

const [w, h] = args.viewport.split('x').map((n) => Number(n));
if (!Number.isFinite(w) || !Number.isFinite(h)) {
  console.error(`Invalid viewport: ${args.viewport}`);
  process.exit(1);
}

const waitMs = Number(args.wait ?? '1000');
const outDir = args.out;
const figmaRaw = args.figma;
const figmaResize = join(outDir, 'figma_resized.png');
const current = join(outDir, 'current.png');
const diff = join(outDir, 'diff.png');
const report = join(outDir, 'report.json');

function runScenarioStep(page, step) {
  switch (step.action) {
    case 'goto':
      return page.goto(step.url);
    case 'waitForSelector':
      return page.waitForSelector(step.selector, { timeout: step.timeout ?? 30_000 });
    case 'waitMs':
      return page.waitForTimeout(step.ms ?? 500);
    case 'fill':
      return page.fill(step.selector, step.value ?? '');
    case 'click':
      return page.click(step.selector);
    case 'press':
      return page.press(step.selector, step.key ?? 'Enter');
    case 'check':
      return page.check(step.selector);
    default:
      throw new Error(`Unsupported scenario action in capture_and_diff: ${step.action}`);
  }
}

async function applyScenarioRoutes(page, routes) {
  if (!Array.isArray(routes) || routes.length === 0) return;
  for (const routeDef of routes) {
    const pattern = routeDef.urlPattern || routeDef.pattern;
    if (!pattern) continue;
    await page.route(pattern, async (route) => {
      const payload =
        routeDef.json !== undefined
          ? JSON.stringify(routeDef.json)
          : routeDef.body !== undefined
            ? String(routeDef.body)
            : '';
      await route.fulfill({
        status: Number(routeDef.status ?? 200),
        contentType: routeDef.contentType || 'application/json',
        body: payload,
        headers: routeDef.headers || undefined,
      });
    });
  }
}

mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  let scenarioJson = null;
  if (args.scenario) {
    scenarioJson = JSON.parse(readFileSync(args.scenario, 'utf8'));
    await applyScenarioRoutes(page, scenarioJson.routes);
  }

  await page.goto(args.url);

  if (scenarioJson) {
    const steps = Array.isArray(scenarioJson.steps) ? scenarioJson.steps : [];
    for (const step of steps) {
      await runScenarioStep(page, step);
    }
  }

  if (args.selector) {
    await page.waitForSelector(args.selector, { timeout: 30_000 });
  }
  await page.waitForTimeout(waitMs);
  await page.screenshot({ path: current });
} finally {
  await browser.close();
}

execSync(`magick "${figmaRaw}" -resize ${w}x${h}\\! "${figmaResize}"`, { stdio: 'inherit' });

let rmseRaw = '';
try {
  rmseRaw = execSync(`compare -metric rmse "${figmaResize}" "${current}" "${diff}" 2>&1`, {
    encoding: 'utf8',
  }).trim();
} catch (error) {
  rmseRaw = String(error.stdout || error.stderr || '').trim();
}

const normalizedMatch = rmseRaw.match(/\(([\d.]+)\)/);
const normalizedRmse = normalizedMatch ? Number(normalizedMatch[1]) : null;

const payload = {
  url: args.url,
  viewport: { width: w, height: h },
  figmaSource: figmaRaw,
  waitMs,
  rmseRaw,
  normalizedRmse,
  artifacts: { figmaResize, current, diff },
  generatedAt: new Date().toISOString(),
};

writeFileSync(report, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(payload, null, 2));
