#!/usr/bin/env node
import { execSync } from 'node:child_process';

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

function fail(message, suggestion = '') {
  console.error(`PREFLIGHT FAILED: ${message}`);
  if (suggestion) console.error(`SUGGESTION: ${suggestion}`);
  process.exit(1);
}

function bool(v, defaultVal = false) {
  if (v == null) return defaultVal;
  return String(v).toLowerCase() === 'true';
}

function getViteProcesses() {
  const raw = execSync('ps -Ao pid=,command=', { encoding: 'utf8' });
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => line.includes('vite'))
    .map((line) => {
      const firstSpace = line.indexOf(' ');
      return {
        pid: line.slice(0, firstSpace).trim(),
        command: line.slice(firstSpace + 1).trim(),
      };
    });
}

async function checkUrl(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    const text = await res.text();
    return { ok: res.ok, status: res.status, text };
  } finally {
    clearTimeout(timer);
  }
}

const args = parseArgs(process.argv);
const projectRoot = args.projectRoot || process.cwd();
const url = args.url || 'http://127.0.0.1:5173/auth/email?lang=zh-CN';
const expectText = args.expectText || '';
const timeoutMs = Number(args.timeoutMs || 5000);
const allowMultiVite = bool(args.allowMultiVite, false);

const viteProcesses = getViteProcesses();
if (viteProcesses.length === 0) {
  fail(
    '未发现 Vite 开发进程。',
    '先启动前端，再重试。若使用本项目脚本，执行 infra/dev/start_all.sh。',
  );
}

const matchingProject = viteProcesses.filter((p) => p.command.includes(projectRoot));
if (matchingProject.length === 0) {
  fail(
    '当前 Vite 进程不在目标项目目录下。',
    `请在 ${projectRoot} 启动 dev server，避免看错旧项目页面。`,
  );
}

if (!allowMultiVite && viteProcesses.length > 1) {
  const lines = viteProcesses.map((p) => `${p.pid} ${p.command}`).join('\n');
  fail(
    `检测到多个 Vite 进程，可能导致页面版本混淆。\n${lines}`,
    '关闭多余 Vite 进程后重试；建议只保留当前项目的一个 dev server。',
  );
}

const health = await checkUrl(url, timeoutMs).catch((error) => {
  fail(
    `访问目标地址失败: ${url} (${error instanceof Error ? error.message : String(error)})`,
    '确认端口和路由可访问，并检查是否启动了错误的服务。',
  );
});

if (!health.ok) {
  fail(
    `目标地址返回异常状态: ${health.status} (${url})`,
    '检查 dev server 日志与路由配置，确认页面已正确挂载。',
  );
}

if (expectText && !health.text.includes(expectText)) {
  fail(
    `页面未包含期望标识: ${expectText}`,
    '可能连接到旧 bundle 或错误项目。请重启当前项目 dev server 并强刷浏览器。',
  );
}

const report = {
  pass: true,
  projectRoot,
  url,
  viteProcesses: matchingProject,
};

console.log(JSON.stringify(report, null, 2));
console.log('PREFLIGHT PASSED');
