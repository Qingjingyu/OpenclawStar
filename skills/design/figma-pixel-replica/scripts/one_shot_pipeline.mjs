#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

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
  console.error(`one_shot_pipeline failed: ${message}`);
  process.exit(1);
}

function run(command, cmdArgs, options, label) {
  const res = spawnSync(command, cmdArgs, { ...options, encoding: 'utf8' });
  if (res.status !== 0) {
    const detail = [res.stdout || '', res.stderr || ''].join('\n').trim();
    fail(`${label}\n${detail}`);
  }
  return res;
}

function nowStamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function nodeSafe(id) {
  return id.replace(/:/g, '_');
}

function toName(value, fallback) {
  return (value || fallback).replace(/[^a-zA-Z0-9-_]/g, '_');
}

function loadInput(raw) {
  if (!raw) fail('Missing --input <json_or_file>');
  const maybePath = resolve(process.cwd(), raw);
  if (existsSync(maybePath)) {
    return JSON.parse(readFileSync(maybePath, 'utf8'));
  }
  return JSON.parse(raw);
}

function makeMinimalScenario(page, pageName, outDir) {
  const scenario = {
    pageName,
    baseUrl: '',
    route: page.url,
    viewport: page.viewport
      ? (() => {
          const [w, h] = page.viewport.split('x').map((n) => Number(n));
          return { width: w, height: h };
        })()
      : { width: 375, height: 812 },
    states: ['initial'],
    steps: [
      { action: 'goto', url: page.url },
      { action: 'waitForSelector', selector: page.selector || '#root' },
      { action: 'waitMs', ms: 500 },
    ],
  };
  const file = join(outDir, `${pageName}.scenario.json`);
  writeFileSync(file, `${JSON.stringify(scenario, null, 2)}\n`, 'utf8');
  return file;
}

const args = parseArgs(process.argv);
const input = loadInput(args.input);
const projectRoot = resolve(args.projectRoot || input.projectRoot || process.cwd());
const runPipeline = args.run === 'false' ? false : true;
const strict = args.strict === 'true';
const outputRoot = resolve(args.out || input.out || `/tmp/figma_one_shot_${nowStamp()}`);
const scriptDir = dirname(fileURLToPath(import.meta.url));
const batchScript = join(scriptDir, 'batch_page_pipeline.mjs');
const fetchScript = join(scriptDir, 'fetch_figma_bundle.sh');
const scenarioDir = join(outputRoot, 'scenarios');
const assetDir = join(outputRoot, 'figma_bundle');
mkdirSync(outputRoot, { recursive: true });
mkdirSync(scenarioDir, { recursive: true });

if (!Array.isArray(input.pages) || input.pages.length === 0) {
  fail('input.pages is required and cannot be empty.');
}

let fileKey = input.fileKey || '';
let tokenEnv = input.tokenEnv || 'FIGMA_TOKEN';
const token = process.env[tokenEnv] || '';
const useFetch = Boolean(fileKey && token);

if (fileKey && !token) {
  fail(`fileKey provided but env ${tokenEnv} is empty. Set env or remove fileKey and pass page.figmaImage.`);
}

const allNodeIds = [...new Set(input.pages.map((p) => p.nodeId).filter(Boolean))];
if (useFetch && allNodeIds.length === 0) {
  fail('fileKey mode requires page.nodeId values.');
}

if (useFetch) {
  run(
    fetchScript,
    [token, fileKey, allNodeIds.join(','), assetDir, input.scales || '1,2,3'],
    { cwd: projectRoot },
    'fetch_figma_bundle.sh failed',
  );
}

const pages = input.pages.map((page, idx) => {
  const name = toName(page.name, `page_${idx + 1}`);
  const scenario = page.scenario
    ? resolve(projectRoot, page.scenario)
    : makeMinimalScenario(page, name, scenarioDir);
  const preScenario = page.preScenario ? resolve(projectRoot, page.preScenario) : scenario;
  const localeGuardScenario = page.localeGuardScenario ? resolve(projectRoot, page.localeGuardScenario) : undefined;

  let figmaImage = page.figmaImage ? resolve(projectRoot, page.figmaImage) : '';
  if (!figmaImage && useFetch && page.nodeId) {
    figmaImage = join(assetDir, `${nodeSafe(page.nodeId)}@3x.png`);
  }
  if (!figmaImage || !existsSync(figmaImage)) {
    fail(`Page ${name} missing usable figma image. Provide page.figmaImage or valid fileKey+nodeId.`);
  }

  return {
    name,
    url: page.url,
    figmaImage,
    scenario,
    preScenario,
    localeGuardScenario,
    viewport: page.viewport || input.defaults?.viewport || '375x812',
    wait: page.wait ?? input.defaults?.wait ?? 1200,
    selector: page.selector || input.defaults?.selector || '#root',
  };
});

const batchConfig = {
  workspaceRoot: projectRoot,
  defaults: {
    viewport: input.defaults?.viewport || '375x812',
    wait: input.defaults?.wait ?? 1200,
    selector: input.defaults?.selector || '#root',
  },
  gates: {
    maxRmse: Number(input.gates?.maxRmse ?? 0.09),
    requireSmokePass: input.gates?.requireSmokePass !== false,
    requireLocaleGuardPass: input.gates?.requireLocaleGuardPass === true,
  },
  pages,
};

const configPath = join(outputRoot, 'auto.batch.config.json');
writeFileSync(configPath, `${JSON.stringify(batchConfig, null, 2)}\n`, 'utf8');

const payload = {
  projectRoot,
  outputRoot,
  configPath,
  runPipeline,
  useFetch,
  pages: pages.map((p) => ({
    name: p.name,
    url: p.url,
    figmaImage: p.figmaImage,
    scenario: p.scenario,
    localeGuardScenario: p.localeGuardScenario || null,
  })),
  generatedAt: new Date().toISOString(),
};
writeFileSync(join(outputRoot, 'one_shot.meta.json'), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

if (runPipeline) {
  const runOut = join(outputRoot, 'run');
  const res = spawnSync(
    process.execPath,
    [batchScript, '--config', configPath, '--out', runOut],
    { cwd: projectRoot, encoding: 'utf8' },
  );
  payload.batch = {
    status: res.status ?? 1,
    strict,
    summaryPath: join(runOut, 'summary.md'),
    summaryJson: join(runOut, 'summary.json'),
  };
  if (res.stdout) process.stdout.write(res.stdout);
  if (res.stderr) process.stderr.write(res.stderr);
  if ((res.status ?? 1) !== 0 && strict) {
    fail('batch_page_pipeline failed in strict mode');
  }
}

console.log(JSON.stringify(payload, null, 2));
if (runPipeline) {
  console.log(`Summary: ${join(outputRoot, 'run', 'summary.md')}`);
}
