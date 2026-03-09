# State Matrix Template

Use this template for any page before final visual tuning.

## Page Meta

- Page name:
- Route:
- Figma node IDs:
- Owner:

## State Matrix

| State | Trigger | API/Logic | Loading UI | Success UI | Error UI | Retry/Timeout | Tracking |
|---|---|---|---|---|---|---|---|
| Initial | Enter route | Init query params / preload | Skeleton or idle layout | Base view rendered | N/A | N/A | page_view |
| Input editing | User typing/selecting | Local validation | Inline hint | Valid state | Validation message | Debounce / blur validate | field_change |
| Submit in progress | CTA click | Request payload + endpoint | Button loading/disabled | Move to success branch | Error toast + field hint | Timeout fallback + retry | submit_click |
| Submit success | 2xx + business success | Persist session/state | Transition UI | Navigate / success card | N/A | N/A | submit_success |
| Submit failure | 4xx/5xx/business fail | Error mapping | Keep current UI | N/A | Error copy per code | Manual retry path | submit_fail |
| Recovery | Retry/back/navigation | Reset partial state | Controlled reset | Return usable state | N/A | Max retry policy | recovery |
| Provider login click | Social button click | Provider routing/map (`line/google/apple`) | Optional loading state | Correct provider jump/hint | Correct provider-specific error copy | Retry allowed | provider_click |
| Language switch | Select language | Rebind copy + layout class | Optional transition | Localized copy and stable layout | Fallback language copy | Keep current form state | language_switch |

## Rules

1. Define at least one failure state per critical action.
2. Define timeout behavior for network actions.
3. Define user-visible feedback for every failure.
4. Keep UI state names aligned with code state enums.
5. For auth pages, include provider mapping state and language switch state.
