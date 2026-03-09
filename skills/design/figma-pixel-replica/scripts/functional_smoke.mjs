#!/usr/bin/env node
import { readFileSync } from 'node:fs';
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
  const suggestion = buildSuggestion(message);
  console.error(`SMOKE FAILED: ${message}`);
  if (suggestion) {
    console.error(`SUGGESTION: ${suggestion}`);
  }
  process.exit(1);
}

function buildSuggestion(message) {
  if (message.includes('assertMaxLines failed')) {
    return '文本换行超限：先缩短文案，再调容器宽度和行高，最后才调字号。必要时加语言专属样式类（如 lang-en / lang-ja）。';
  }
  if (message.includes('assertTextContains failed')) {
    return '文案断言失败：检查按钮与处理函数映射是否正确，确认 provider 文案与实际逻辑一致。';
  }
  if (message.includes('assertEnabled failed')) {
    return '控件不可用：避免永久禁用主按钮，保留可点击并给出明确校验提示。仅在请求进行中或倒计时锁定时禁用。';
  }
  if (message.includes('assertVisible failed')) {
    return '元素不可见：检查状态推进步骤是否完整（输入、勾选、点击），并确认是否需要 mock 路由把页面推进到目标状态。';
  }
  if (message.includes('assertUrlContains failed')) {
    return '跳转断言失败：检查路由模板、query 参数和重定向条件；必要时先断言中间状态提示文案。';
  }
  return '';
}

const args = parseArgs(process.argv);
if (!args.scenario) {
  fail('Missing --scenario <json_file>');
}

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

const scenario = JSON.parse(readFileSync(args.scenario, 'utf8'));
const viewport = scenario.viewport ?? { width: 375, height: 812 };
const baseUrl = scenario.baseUrl ?? '';
const steps = Array.isArray(scenario.steps) ? scenario.steps : [];
const routes = Array.isArray(scenario.routes) ? scenario.routes : [];

if (steps.length === 0) {
  fail('Scenario has no steps');
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport });

try {
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

  for (const [idx, step] of steps.entries()) {
    const id = `step ${idx + 1}`;
    switch (step.action) {
      case 'goto': {
        const url = step.url.startsWith('http') ? step.url : `${baseUrl}${step.url}`;
        await page.goto(url);
        break;
      }
      case 'waitForSelector':
        await page.waitForSelector(step.selector, { timeout: step.timeout ?? 30_000 });
        break;
      case 'waitMs':
        await page.waitForTimeout(step.ms ?? 500);
        break;
      case 'fill':
        await page.fill(step.selector, step.value ?? '');
        break;
      case 'click':
        await page.click(step.selector);
        break;
      case 'press':
        await page.press(step.selector, step.key ?? 'Enter');
        break;
      case 'assertVisible':
        if (!(await page.locator(step.selector).isVisible())) {
          fail(`${id} assertVisible failed: ${step.selector}`);
        }
        break;
      case 'assertEnabled':
        if (!(await page.locator(step.selector).isEnabled())) {
          fail(`${id} assertEnabled failed: ${step.selector}`);
        }
        break;
      case 'assertTextContains': {
        const text = await page.locator(step.selector).innerText();
        if (!text.includes(step.text ?? '')) {
          fail(`${id} assertTextContains failed: ${step.selector}`);
        }
        break;
      }
      case 'assertMaxLines': {
        const maxLines = Number(step.maxLines ?? 1);
        const lineCount = await page.$eval(step.selector, (el) => {
          const style = window.getComputedStyle(el);
          const lineHeightRaw = style.lineHeight;
          const lineHeight = Number.parseFloat(lineHeightRaw);
          const rect = el.getBoundingClientRect();

          if (!Number.isFinite(lineHeight) || lineHeight <= 0) {
            return 1;
          }
          return Math.max(1, Math.round(rect.height / lineHeight));
        });
        if (lineCount > maxLines) {
          fail(`${id} assertMaxLines failed: ${step.selector}, lines=${lineCount}, max=${maxLines}`);
        }
        break;
      }
      case 'assertUrlContains': {
        const current = page.url();
        if (!current.includes(step.text ?? '')) {
          fail(`${id} assertUrlContains failed: ${current}`);
        }
        break;
      }
      default:
        fail(`${id} unknown action: ${step.action}`);
    }
  }
} finally {
  await browser.close();
}

console.log('SMOKE PASSED');
