---
name: figma-pixel-replica
description: Use when implementing any Figma-designed page with high-fidelity visual restoration plus real functional behavior, including responsive adaptation, screenshot-diff verification, and business-state completeness.
---

# Figma Pixel Replica

## Overview

Run a dual-track delivery loop: restore UI from Figma with measurable visual evidence, while implementing real user flows and state transitions so the page is usable, not just visually similar.

## When to Use

- Build login, onboarding, dashboard, form, detail, or payment pages from Figma.
- Receive feedback like "looks close but still wrong."
- Need one reusable workflow for many page types, not a one-off fix.

Do not use for intentional redesign tasks.

## Inputs

Provide these before implementation:

1. Figma file key and target node IDs (per page state).
2. Target routes and real API contracts for the page.
3. Required interaction states using `references/state_matrix_template.md`.
4. Viewport profiles (mobile, tablet, desktop) and adaptation rules.
5. Workspace has Playwright installed (`npm i -D playwright`) for automation scripts.

## Core Workflow

### 0. Run preflight (mandatory)

Before any visual or functional validation, confirm you are looking at the right running project:

```bash
node scripts/preflight_dev_env.mjs \
  --projectRoot "$PWD" \
  --url "http://127.0.0.1:5173/auth/email?lang=zh-CN"
```

This prevents stale-process / wrong-port review mistakes.

### Fast Path (recommended)

Give one input JSON and run one command:

```bash
node scripts/one_shot_pipeline.mjs \
  --input ./assets/one_shot_input_template.json \
  --out /tmp/figma_one_shot_run
```

If `fileKey + tokenEnv` are provided, it auto-downloads Figma assets (1x/2x/3x), auto-generates scenarios, auto-builds batch config, and auto-runs full pipeline.

If `fileKey` is omitted, provide `pages[].figmaImage` directly and it still runs.

By default, one-shot always returns artifacts even when a gate fails. Add `--strict true` to force non-zero exit on gate failure.

### Zero-Config Fast Path (URL first)

If you only have a Figma URL and want minimal setup:

```bash
node scripts/run_from_figma_link.mjs \
  --figmaUrl "https://www.figma.com/design/<fileKey>/<name>?node-id=68-9678" \
  --pageUrl "http://127.0.0.1:5173/auth/email?lang=zh-CN" \
  --projectRoot "$PWD" \
  --mcp "figd_xxx_optional"
```

Optional quality gates:

- `--localeGuardScenario ./assets/auth_multilang_guard_template.json`
- `--requireLocaleGuardPass true`
- `--strict true`
- `--dryRun true` (only generate auto config, do not execute pipeline)

### 1. Pull authoritative design artifacts

Use `scripts/fetch_figma_bundle.sh` to download:

- Node JSON
- PNG snapshots at `1x/2x/3x`
- SVG snapshots when available
- Download manifest

```bash
./scripts/fetch_figma_bundle.sh "$FIGMA_TOKEN" "$FILE_KEY" "68:8642,68:9678" "/tmp/figma_bundle"
```

### 2. Freeze page state matrix before styling

Fill `references/state_matrix_template.md` for each page:

- UI state name
- Trigger
- API call / payload
- Success UI
- Failure UI
- Retry and timeout behavior

Do not start final visual tuning before state matrix is complete.

### 3. Implement real functionality first-pass

Wire actual business behavior:

- Real form validation
- Real API requests
- Loading, success, error, timeout states
- Real redirect/navigation outcomes

Avoid static placeholders and fake “happy path only” logic.

### 4. Restore visuals with measured diff loop

Use `scripts/capture_and_diff.mjs` in matching viewport:

```bash
node scripts/capture_and_diff.mjs \
  --url "http://127.0.0.1:5173/auth/email?lang=zh-CN" \
  --figma "/tmp/figma_bundle/68_8642@3x.png" \
  --out "/tmp/compare_login" \
  --viewport "375x812" \
  --wait "1200"
```

Patch in tiny deltas. Repeat until visual hotspots disappear.

### 5. Validate behavior with smoke scenarios

Use `scripts/functional_smoke.mjs` with a scenario JSON:

```bash
node scripts/functional_smoke.mjs --scenario ./assets/page_spec_template.json
```

Confirm key flows are actually usable.

The smoke engine also supports:

- `routes[]` request mocking for deterministic state setup.
- `assertMaxLines` to gate ugly localization wrapping.

### 6. Enforce responsive adaptation

Apply `references/responsive_adaptation_playbook.md`:

- Maintain design intent across breakpoints
- Preserve spacing rhythm and hierarchy
- Avoid clipped controls and hidden CTAs

### 7. Gate by delivery checklist

Run `references/page_delivery_checklist.md` before sign-off.

### 7.1 Localization + provider guard (mandatory for auth-like pages)

```bash
node scripts/functional_smoke.mjs \
  --scenario ./assets/auth_multilang_guard_template.json
```

This scenario enforces:

- `zh-CN` / `ja-JP` / `en-US` OTP layout wrap quality.
- Social provider button mapping and feedback copy consistency.

### 7.2 Generate per-language screenshot report

```bash
node scripts/localization_capture_report.mjs \
  --config ./assets/auth_localization_capture_template.json \
  --out /tmp/auth_locale_report
```

Outputs:

- `summary.json` (machine-readable)
- `report.md` + per-language screenshots (`zh-CN.png`, `ja-JP.png`, `en-US.png`)

### 8. Run multi-page batch pipeline

For multiple pages, run one command with a config file:

```bash
node scripts/batch_page_pipeline.mjs \
  --config ./assets/batch_pipeline_template.json \
  --out /tmp/figma_batch_report
```

Batch mode will:

- Optionally fetch Figma bundles once
- Run screenshot diff per page
- Run functional smoke per page
- Generate `summary.json` and `summary.md`
- Fail fast on gate violations

## One-Shot Input Schema

Use `assets/one_shot_input_template.json`.

Required:

- `projectRoot`
- `pages[]` with:
  - `name`
  - `url`
  - `nodeId` (when using Figma fetch) or `figmaImage` (when skipping fetch)

Optional:

- `fileKey`
- `tokenEnv` (default `FIGMA_TOKEN`)
- `defaults.viewport`, `defaults.wait`, `defaults.selector`
- `gates.maxRmse`, `gates.requireSmokePass`, `gates.requireLocaleGuardPass`
- `pages[].preScenario` to drive UI into target state before screenshot
- `pages[].localeGuardScenario` to enforce localization/provider guard
- `preScenario.routes[]` to mock API responses needed for deterministic page states

Examples:

- `assets/auth_otp_prestep_template.json`
- `assets/auth_multilang_guard_template.json`
- `assets/auth_localization_capture_template.json`

## Output Contract (Per Page)

Deliver all items:

1. Implemented page with real business flow.
2. State matrix record.
3. Visual evidence package: figma/current/diff images + RMSE report.
4. Functional smoke result.
5. Responsive screenshots for agreed viewports.

## Default Quality Thresholds

- Visual: normalized RMSE <= `0.09` for main screen.
- Functional: critical path pass rate = `100%`.
- Responsive: no overflow, clipped text, or unreachable CTA.

Adjust thresholds only with explicit product-owner approval.

## Quality Guardrails

- Never claim "pixel-perfect" without screenshot evidence.
- Never deliver “only looks right” pages without working behavior.
- Never mix redesign ideas into restoration tasks.
- If RMSE worsens, rollback only the last delta and retry.
- If Figma API is unstable (`connection reset`), retry serially; avoid parallel fetches.
- If page logic and design conflict, keep business correctness first, then resolve visual gap.

## Lessons Learned (Auth / OTP Iteration)

Use these as hard rules for future pages, not suggestions:

1. **Validation feedback must be triggerable**
- Do not permanently disable primary CTA on invalid form state.
- Keep CTA clickable unless request is in-flight or countdown lock is active.
- On click, always show clear inline error for missing/invalid required fields.

2. **Provider mapping must be explicit**
- Do not infer social provider from icon shape alone.
- Define provider mapping in code (`line`, `google`, `apple`) and align labels/handlers/messages together.
- Verify each provider button returns the correct copy and route in smoke tests.

3. **Language-specific layout pass is mandatory**
- Run OTP/auth states in `zh-CN`, `ja-JP`, `en-US`.
- For each language, verify title/helper/resend/CTA text does not produce ugly wraps.
- If wrapping harms readability, first tune copy length + container width + line-height, then font size.

4. **State capture must be deterministic**
- For OTP-like pages, use route mocks (`preScenario.routes`) to force target state before screenshot.
- Avoid depending on live SMTP/network timing for visual verification.

5. **Runtime consistency check before review**
- Ensure only one frontend dev server serves the reviewed route.
- Verify reviewed URL matches current branch build (avoid stale process/old bundle confusion).
