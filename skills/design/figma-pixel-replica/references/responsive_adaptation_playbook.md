# Responsive Adaptation Playbook

Apply this playbook to keep design intent while adapting to different screens.

## 1. Define viewports first

Minimum set:

- Mobile portrait: `375x812`
- Mobile small: `360x780`
- Tablet: `768x1024`
- Desktop preview: `1280x900`

## 2. Preserve anchor hierarchy

Lock these anchors per page:

1. Top system/navigation region
2. Main card/content container start point
3. Primary CTA area
4. Bottom safe area / home indicator area

When adapting, preserve order and visual rhythm before adjusting decoration.

## 3. Adapt by rules, not guesses

- Use proportional spacing for vertical rhythm.
- Use min/max widths for central cards.
- Keep tap targets >= 40px height.
- Keep line-height readable after localization.
- Avoid absolute positioning for critical controls.

## 4. Validate localization impact

Check at least two languages with longer text:

- Verify buttons keep readable text.
- Verify helper text wraps without overlap.
- Verify policy/legal links remain tappable.
- For auth pages, verify social provider button behavior and copy match the actual provider mapping.
- Prefer exporting a language screenshot report (`scripts/localization_capture_report.mjs`) for sign-off evidence.

## 5. Common failure fixes

- Clipped bottom CTA: add safe-area padding and test keyboard open state.
- Header drift: pin top stack to explicit height zones.
- Text overflow: reduce font-size only after adjusting container/line-height.
- Icon blur mismatch: prioritize original exported asset scale (`3x`).
