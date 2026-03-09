#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, join, basename } from 'node:path';
import { createRequire } from 'node:module';

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

function fail(message) {
  console.error(`LOCALE REPORT FAILED: ${message}`);
  process.exit(1);
}

function bool(v, defaultVal = false) {
  if (v == null) return defaultVal;
  return String(v).toLowerCase() === 'true';
}

function resolveMaxLines(maxLines, langCode) {
  if (typeof maxLines === 'number') return maxLines;
  if (maxLines && typeof maxLines === 'object') {
    if (typeof maxLines[langCode] === 'number') return maxLines[langCode];
    if (typeof maxLines.default === 'number') return maxLines.default;
  }
  return null;
}

const args = parseArgs(process.argv);
if (!args.config) {
  fail('Missing --config <json_file>');
}

const configPath = resolve(process.cwd(), args.config);
const config = JSON.parse(readFileSync(configPath, 'utf8'));
const outDir = resolve(process.cwd(), args.out || config.outDir || `/tmp/locale_report_${Date.now()}`);
mkdirSync(outDir, { recursive: true });

const requireFromCwd = createRequire(`${process.cwd()}/`);
let chromium;
try {
  ({ chromium } = requireFromCwd('playwright'));
} catch {
  try {
    ({ chromium } = requireFromCwd('@playwright/test'));
  } catch {
    fail('Cannot find Playwright from current workspace. Install with: npm i -D playwright');
  }
}

const baseUrl = config.baseUrl || 'http://127.0.0.1:5173';
const routeTemplate = config.routeTemplate || '/auth/email?lang={lang}';
const viewport = config.viewport || { width: 390, height: 844 };
const waitMs = Number(config.waitMs ?? 250);
const strict = bool(args.strict, bool(config.strict, true));
const routes = Array.isArray(config.routes) ? config.routes : [];
const lineChecks = Array.isArray(config.lineChecks) ? config.lineChecks : [];
const languages = Array.isArray(config.languages) ? config.languages : ['zh-CN', 'ja-JP', 'en-US'];
const preState = config.preState || { type: 'none' };

if (languages.length === 0) {
  fail('languages cannot be empty');
}

function toLangObject(item) {
  if (typeof item === 'string') {
    return { code: item, name: item };
  }
  return { code: item.code, name: item.name || item.code };
}

const browser = await chromium.launch({ headless: true });
const summary = [];
let hasFailure = false;

try {
  for (const langItem of languages) {
    const lang = toLangObject(langItem);
    const page = await browser.newPage({ viewport });

    for (const routeDef of routes) {
      const method = (routeDef.method || '').toUpperCase();
      const status = Number(routeDef.status ?? 200);
      const contentType = routeDef.contentType || 'application/json';
      const hasJson = Object.prototype.hasOwnProperty.call(routeDef, 'json');
      const body = hasJson
        ? JSON.stringify(routeDef.json)
        : routeDef.body != null
          ? String(routeDef.body)
          : '';

      await page.route(routeDef.urlPattern, async (route) => {
        if (method && route.request().method().toUpperCase() !== method) {
          await route.continue();
          return;
        }
        await route.fulfill({ status, contentType, body });
      });
    }

    const route =
      typeof langItem === 'object' && langItem.route
        ? langItem.route
        : routeTemplate.replace('{lang}', encodeURIComponent(lang.code));
    const targetUrl = route.startsWith('http') ? route : `${baseUrl}${route}`;
    await page.goto(targetUrl, { waitUntil: 'networkidle' });

    if (preState.type === 'authOtp') {
      await page.waitForSelector(preState.emailSelector || '#email-input', { timeout: 30_000 });
      await page.fill(preState.emailSelector || '#email-input', preState.email || 'eotoai@gmail.com');
      await page.click(preState.agreeSelector || 'label[for="agree-policy"] .checkbox-visual');
      await page.click(preState.submitSelector || 'button[data-node-id="20:422"]');
      await page.waitForSelector(preState.readySelector || '.otp-title-block h2', { timeout: 30_000 });
      await page.waitForTimeout(waitMs);
    } else if (preState.readySelector) {
      await page.waitForSelector(preState.readySelector, { timeout: 30_000 });
      await page.waitForTimeout(waitMs);
    }

    const checks = [];
    for (const check of lineChecks) {
      const maxLines = resolveMaxLines(check.maxLines, lang.code);
      const lineCount = await page.$eval(check.selector, (el) => {
        const style = window.getComputedStyle(el);
        const lineHeight = Number.parseFloat(style.lineHeight);
        const rect = el.getBoundingClientRect();
        if (!Number.isFinite(lineHeight) || lineHeight <= 0) return 1;
        return Math.max(1, Math.round(rect.height / lineHeight));
      });
      const pass = maxLines == null ? true : lineCount <= maxLines;
      checks.push({
        name: check.name || check.selector,
        selector: check.selector,
        lineCount,
        maxLines,
        pass,
      });
    }

    const imageFile = `${lang.code}.png`;
    const imagePath = join(outDir, imageFile);
    await page.screenshot({ path: imagePath, fullPage: true });
    await page.close();

    const languagePass = checks.every((c) => c.pass);
    if (!languagePass) hasFailure = true;
    summary.push({
      code: lang.code,
      name: lang.name,
      url: targetUrl,
      screenshot: imageFile,
      pass: languagePass,
      checks,
    });
  }
} finally {
  await browser.close();
}

const result = {
  generatedAt: new Date().toISOString(),
  configPath,
  outDir,
  strict,
  overallPass: !hasFailure,
  languages: summary,
};

writeFileSync(join(outDir, 'summary.json'), `${JSON.stringify(result, null, 2)}\n`, 'utf8');

const checkHeaders = [...new Set(lineChecks.map((c) => c.name || c.selector))];
const headerRow = ['Language', 'Result', ...checkHeaders, 'Screenshot'];
const sepRow = headerRow.map(() => '---');
const lines = [
  '# Localization Capture Report',
  '',
  `- Generated: ${result.generatedAt}`,
  `- Config: ${configPath}`,
  `- Overall: ${result.overallPass ? 'PASS' : 'FAIL'}`,
  '',
  `| ${headerRow.join(' | ')} |`,
  `| ${sepRow.join(' | ')} |`,
];

for (const lang of summary) {
  const byName = new Map(lang.checks.map((c) => [c.name, c]));
  const checkCells = checkHeaders.map((name) => {
    const c = byName.get(name);
    if (!c) return 'N/A';
    if (c.maxLines == null) return `${c.lineCount}`;
    return `${c.lineCount}/${c.maxLines} ${c.pass ? 'PASS' : 'FAIL'}`;
  });
  lines.push(
    `| ${lang.code} | ${lang.pass ? 'PASS' : 'FAIL'} | ${checkCells.join(' | ')} | ![${lang.code}](${basename(
      lang.screenshot,
    )}) |`,
  );
}

if (hasFailure) {
  lines.push('');
  lines.push('## Fix Suggestions');
  lines.push('- 优先缩短过长文案。');
  lines.push('- 调整语言专属容器宽度和行高（如 `lang-en` / `lang-ja`）。');
  lines.push('- 最后才降低字号，避免视觉层级被破坏。');
}

writeFileSync(join(outDir, 'report.md'), `${lines.join('\n')}\n`, 'utf8');

console.log(JSON.stringify(result, null, 2));
console.log(`Report: ${join(outDir, 'report.md')}`);

if (strict && hasFailure) {
  process.exit(2);
}
