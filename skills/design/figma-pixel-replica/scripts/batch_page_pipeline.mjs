#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

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

function runOrFail(command, commandArgs, options, label) {
  const result = spawnSync(command, commandArgs, { ...options, encoding: 'utf8' });
  if (result.status !== 0) {
    const detail = [result.stdout || '', result.stderr || ''].join('\n').trim();
    throw new Error(`${label} failed.\n${detail}`);
  }
  return result;
}

function toSafeName(name) {
  return name.replace(/[^a-zA-Z0-9-_]/g, '_');
}

function toAbsolute(pathOrUndefined, cwd) {
  if (!pathOrUndefined) return undefined;
  return pathOrUndefined.startsWith('/') ? pathOrUndefined : resolve(cwd, pathOrUndefined);
}

function nowStamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

const args = parseArgs(process.argv);
if (!args.config) {
  console.error('Usage: node scripts/batch_page_pipeline.mjs --config <json_file> [--out <output_dir>]');
  process.exit(1);
}

const scriptDir = dirname(fileURLToPath(import.meta.url));
const captureScript = join(scriptDir, 'capture_and_diff.mjs');
const smokeScript = join(scriptDir, 'functional_smoke.mjs');
const fetchScript = join(scriptDir, 'fetch_figma_bundle.sh');

const configPath = resolve(process.cwd(), args.config);
if (!existsSync(configPath)) {
  console.error(`Config not found: ${configPath}`);
  process.exit(1);
}

const config = JSON.parse(readFileSync(configPath, 'utf8'));
const workspaceRoot = toAbsolute(config.workspaceRoot, process.cwd()) || process.cwd();
const outDir = toAbsolute(args.out, process.cwd()) || `/tmp/figma_batch_${nowStamp()}`;
const gates = config.gates ?? {};
const maxRmse = Number(gates.maxRmse ?? 0.09);
const requireSmokePass = gates.requireSmokePass !== false;
const requireLocaleGuardPass = gates.requireLocaleGuardPass === true;
const pages = Array.isArray(config.pages) ? config.pages : [];

if (pages.length === 0) {
  console.error('Config must include at least one page in "pages".');
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });

if (config.figmaFetch) {
  const tokenEnv = config.figmaFetch.tokenEnv ?? 'FIGMA_TOKEN';
  const token = process.env[tokenEnv];
  const fileKey = config.figmaFetch.fileKey;
  const nodeIds = Array.isArray(config.figmaFetch.nodeIds) ? config.figmaFetch.nodeIds.join(',') : '';
  const bundleDir = toAbsolute(config.figmaFetch.bundleDir, process.cwd()) || join(outDir, 'figma_bundle');
  const scales = config.figmaFetch.scales ?? '1,2,3';

  if (!token) {
    console.error(`Skipping figmaFetch: env ${tokenEnv} is empty.`);
  } else if (!fileKey || !nodeIds) {
    console.error('Skipping figmaFetch: missing fileKey or nodeIds in config.figmaFetch.');
  } else {
    runOrFail(fetchScript, [token, fileKey, nodeIds, bundleDir, scales], { cwd: workspaceRoot }, 'figmaFetch');
  }
}

const summary = {
  configPath,
  workspaceRoot,
  outDir,
  generatedAt: new Date().toISOString(),
  gates: { maxRmse, requireSmokePass, requireLocaleGuardPass },
  pages: [],
};

let failed = false;

for (const page of pages) {
  const name = page.name || page.url || 'page';
  const pageSafe = toSafeName(name);
  const pageDir = join(outDir, pageSafe);
  mkdirSync(pageDir, { recursive: true });

  const viewport = page.viewport || config.defaults?.viewport || '375x812';
  const wait = String(page.wait ?? config.defaults?.wait ?? 1200);
  const selector = page.selector ?? config.defaults?.selector;
  const figmaImage = toAbsolute(page.figmaImage, process.cwd());
  const scenario = toAbsolute(page.scenario, process.cwd());
  const preScenario = toAbsolute(page.preScenario, process.cwd());
  const localeGuardScenario = toAbsolute(page.localeGuardScenario, process.cwd());

  const pageReport = {
    name,
    url: page.url,
    viewport,
    figmaImage,
    scenario: scenario || null,
    preScenario: preScenario || null,
    localeGuardScenario: localeGuardScenario || null,
    rmse: null,
    smokePassed: null,
    localeGuardPassed: null,
    pass: false,
    errors: [],
    artifacts: {
      dir: pageDir,
      diffReport: join(pageDir, 'report.json'),
    },
  };

  try {
    if (!page.url || !figmaImage) {
      throw new Error('Missing page.url or page.figmaImage.');
    }
    if (!existsSync(figmaImage)) {
      throw new Error(`Figma image not found: ${figmaImage}`);
    }

    const captureArgs = [
      captureScript,
      '--url',
      page.url,
      '--figma',
      figmaImage,
      '--out',
      pageDir,
      '--viewport',
      viewport,
      '--wait',
      wait,
    ];
    if (selector) {
      captureArgs.push('--selector', selector);
    }
    if (preScenario) {
      if (!existsSync(preScenario)) {
        throw new Error(`Pre-scenario not found: ${preScenario}`);
      }
      captureArgs.push('--scenario', preScenario);
    }

    runOrFail(process.execPath, captureArgs, { cwd: workspaceRoot }, `${name} capture_and_diff`);

    const diffJson = JSON.parse(readFileSync(join(pageDir, 'report.json'), 'utf8'));
    pageReport.rmse = diffJson.normalizedRmse;

    if (scenario) {
      if (!existsSync(scenario)) {
        throw new Error(`Scenario not found: ${scenario}`);
      }
      runOrFail(process.execPath, [smokeScript, '--scenario', scenario], { cwd: workspaceRoot }, `${name} smoke`);
      pageReport.smokePassed = true;
    } else {
      pageReport.smokePassed = requireSmokePass ? false : null;
    }

    if (localeGuardScenario) {
      if (!existsSync(localeGuardScenario)) {
        throw new Error(`Locale guard scenario not found: ${localeGuardScenario}`);
      }
      runOrFail(
        process.execPath,
        [smokeScript, '--scenario', localeGuardScenario],
        { cwd: workspaceRoot },
        `${name} locale_guard`,
      );
      pageReport.localeGuardPassed = true;
    } else {
      pageReport.localeGuardPassed = requireLocaleGuardPass ? false : null;
    }

    const rmsePass = typeof pageReport.rmse === 'number' && pageReport.rmse <= maxRmse;
    const smokePass = requireSmokePass ? pageReport.smokePassed === true : true;
    const localePass = requireLocaleGuardPass ? pageReport.localeGuardPassed === true : true;
    pageReport.pass = rmsePass && smokePass && localePass;
  } catch (error) {
    pageReport.pass = false;
    pageReport.errors.push(error instanceof Error ? error.message : String(error));
  }

  if (!pageReport.pass) failed = true;
  summary.pages.push(pageReport);
}

summary.passRate = `${summary.pages.filter((p) => p.pass).length}/${summary.pages.length}`;
summary.overallPass = !failed;

writeFileSync(join(outDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');

const mdLines = [
  '# Batch Pipeline Summary',
  '',
  `- Generated: ${summary.generatedAt}`,
  `- Workspace: ${workspaceRoot}`,
  `- Output: ${outDir}`,
  `- Overall: ${summary.overallPass ? 'PASS' : 'FAIL'}`,
  `- Pass rate: ${summary.passRate}`,
  '',
  '| Page | RMSE | Smoke | Locale Guard | Result |',
  '|---|---:|---:|---:|---|',
];

for (const page of summary.pages) {
  mdLines.push(
    `| ${page.name} | ${page.rmse ?? 'N/A'} | ${page.smokePassed === null ? 'N/A' : page.smokePassed ? 'PASS' : 'FAIL'} | ${
      page.localeGuardPassed === null ? 'N/A' : page.localeGuardPassed ? 'PASS' : 'FAIL'
    } | ${page.pass ? 'PASS' : 'FAIL'} |`,
  );
  for (const err of page.errors) {
    mdLines.push(`- ${page.name} error: ${err}`);
  }
}

writeFileSync(join(outDir, 'summary.md'), `${mdLines.join('\n')}\n`, 'utf8');
console.log(`Batch summary: ${join(outDir, 'summary.md')}`);

if (failed) process.exit(2);
