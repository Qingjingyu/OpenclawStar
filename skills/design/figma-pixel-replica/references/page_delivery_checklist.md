# Page Delivery Checklist

Use this checklist as the release gate for every page.

## A. Visual Fidelity

- Figma node IDs and route are mapped.
- `1x/2x/3x` assets are archived for traceability.
- Latest `figma/current/diff` screenshots are generated.
- RMSE value is recorded and within agreed threshold.
- No obvious hotspot in diff image (title, CTA, spacing anchors).

## B. Functional Usability

- Primary action works with real API.
- Primary CTA gives explicit validation feedback on click (no silent no-op).
- Validation works for both happy path and invalid input.
- Error, timeout, and retry are visible and usable.
- Success flow performs correct redirect/state update.
- Social provider buttons map to correct provider logic and copy (no handler/message mismatch).
- No fake-only interaction remains.

## C. Responsive Adaptation

- Page renders correctly on agreed viewports.
- CTA remains reachable without layout break.
- Text does not clip/overlap in localized content.
- Localization gate: run `zh-CN` / `ja-JP` / `en-US` and verify critical copy stays readable without ugly breaks in title, helper text, resend row, and primary CTA.
- For auth-like pages, run `assets/auth_multilang_guard_template.json` through `scripts/functional_smoke.mjs`.
- Safe-area / bottom indicator / nav spacing is stable.

## D. Engineering Quality

- `scripts/preflight_dev_env.mjs` passes before validation.
- `lint` passes.
- `build` passes.
- Functional smoke scenario passes.
- Route state setup for screenshot-diff is deterministic (mocked pre-state when needed).
- Key assumptions are documented.

## E. Hand-off Package

- Before/after evidence bundle exported.
- Per-language screenshot report exported (`report.md` + locale PNGs).
- State matrix attached.
- Open risks and follow-up items listed.
