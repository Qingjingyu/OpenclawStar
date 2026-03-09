#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
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

function fail(message) {
  console.error(`run_from_figma_link failed: ${message}`);
  process.exit(1);
}

function parseFigmaUrl(figmaUrl) {
  let url;
  try {
    url = new URL(figmaUrl);
  } catch {
    fail(`Invalid figma url: ${figmaUrl}`);
  }

  const parts = url.pathname.split('/').filter(Boolean);
  const designIdx = parts.findIndex((p) => p === 'design');
  if (designIdx < 0 || !parts[designIdx + 1]) {
    fail(`Cannot parse file key from figma url: ${figmaUrl}`);
  }
  const fileKey = parts[designIdx + 1];

  const nodeIdRaw = url.searchParams.get('node-id');
  if (!nodeIdRaw) {
    fail(`Cannot find node-id in figma url: ${figmaUrl}`);
  }
  const nodeId = nodeIdRaw.replace('-', ':');
  return { fileKey, nodeId };
}

function runOrFail(command, commandArgs, options, label) {
  const res = spawnSync(command, commandArgs, { ...options, encoding: 'utf8' });
  if (res.stdout) process.stdout.write(res.stdout);
  if (res.stderr) process.stderr.write(res.stderr);
  if (res.status !== 0) {
    fail(`${label} failed`);
  }
}

const args = parseArgs(process.argv);
const figmaUrl = args.figmaUrl || args.figma || '';
if (!figmaUrl) {
  fail('Missing --figmaUrl <url>');
}

const projectRoot = resolve(args.projectRoot || process.cwd());
const pageUrl = args.pageUrl || args.url || 'http://127.0.0.1:5173/auth/email?lang=zh-CN';
const pageName = args.pageName || 'figma-page';
const tokenEnv = args.tokenEnv || 'FIGMA_TOKEN';
const out = resolve(args.out || `/tmp/figma_link_run_${Date.now()}`);
const runPipeline = args.run === 'false' ? 'false' : 'true';
const strict = args.strict === 'true' ? 'true' : 'false';
const dryRun = args.dryRun === 'true';
const scales = args.scales || '1,2,3';
const preScenario = args.preScenario || '';
const localeGuardScenario = args.localeGuardScenario || '';
const mcpRef = args.mcp || args.figmaMcp || '';

const token = process.env[tokenEnv];
if (!dryRun && !token) {
  fail(`Env ${tokenEnv} is empty. Export it first, then rerun. If you only want config generation, use --dryRun true.`);
}

const { fileKey, nodeId } = parseFigmaUrl(figmaUrl);
mkdirSync(out, { recursive: true });

const input = {
  projectRoot,
  tokenEnv,
  fileKey,
  defaults: {
    viewport: args.viewport || '375x812',
    wait: Number(args.wait || 1200),
    selector: args.selector || '#root',
  },
  scales,
  gates: {
    maxRmse: Number(args.maxRmse || 0.09),
    requireSmokePass: args.requireSmokePass === 'false' ? false : true,
    requireLocaleGuardPass: args.requireLocaleGuardPass === 'true',
  },
  pages: [
    {
      name: pageName,
      nodeId,
      url: pageUrl,
      ...(preScenario ? { preScenario } : {}),
      ...(localeGuardScenario ? { localeGuardScenario } : {}),
    },
  ],
};

if (mcpRef) {
  input.meta = { figmaMcp: mcpRef };
}

const inputPath = join(out, 'auto.one_shot_input.json');
writeFileSync(inputPath, `${JSON.stringify(input, null, 2)}\n`, 'utf8');

const scriptDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const oneShotScript = resolve(join(scriptDir, 'one_shot_pipeline.mjs'));
if (!dryRun) {
  runOrFail(
    process.execPath,
    [oneShotScript, '--input', inputPath, '--out', out, '--run', runPipeline, '--strict', strict],
    { cwd: projectRoot },
    'one_shot_pipeline',
  );
}

console.log(
  JSON.stringify(
    {
      ok: true,
      mcpRef: mcpRef || null,
      fileKey,
      nodeId,
      dryRun,
      inputPath,
      outputDir: out,
    },
    null,
    2,
  ),
);
