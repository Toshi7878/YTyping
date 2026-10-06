# select

2026-10-06, transformation engine (legacy `new-york` style). The most structurally invasive migration so far: generic-Root bare re-export, a real selected-label display regression that needed fixing at every call site, and a default-mode flip.

## Changed

- `src/ui/select/select.tsx`: `radix-ui` -> `@base-ui/react/select`. Per `wrapper-shapes.md`'s explicit guidance: `Select` is now `const Select = SelectPrimitive.Root` — a **bare re-export**, not a wrapper function. `SelectRoot` is generic (`<Value, Multiple>`) with no default for `Value`; wrapping it in an ordinary function component (the RadioGroup mistake from earlier in this migration) would erase the generic to `unknown` for every consumer. The bare re-export lets each JSX call site infer its own `Value` independently, same as calling any generic function.
- `Content` -> `Portal > Positioner > Popup`; `Viewport` -> `List`; `ScrollUpButton`/`ScrollDownButton` -> `ScrollUpArrow`/`ScrollDownArrow` (renamed, same role). `Label` -> **`GroupLabel`**, not `Select.Label` — Base UI's own `Select.Label` is a new, different part that labels the *trigger*, not a group inside the popup; using it here would have been a silent, wrong substitution the mapping tables specifically warn about.
- `position` prop dropped; replaced by `alignItemWithTrigger` (boolean) on `Positioner`. This project's wrapper default was `position = "popper"` (not Radix's own default, `"item-aligned"`), which maps to `alignItemWithTrigger={false}` — **not** `true` as the naive "boolean default `true`" reading of the docs would suggest. Got this backwards on the first pass and had to correct it: `"popper"` (anchored like a normal popover, needs the width-matching/translate classes) is the `false` case, `"item-aligned"` (overlaps the trigger) is the `true`/default case. The existing conditional classes (translate-by-side, width-matching via CSS vars) were flipped from `position === "popper" && ...` to `!alignItemWithTrigger && ...` to preserve the exact original visual behavior under the new (inverted) default.
- CSS vars: `--radix-select-content-available-height` -> `--available-height`; `--radix-select-content-transform-origin` -> `--transform-origin`; `--radix-select-trigger-height`/`-width` -> `--anchor-height`/`--anchor-width`.
- `SelectTrigger`'s `Icon asChild` -> `Icon render={...}` (no `data-disabled` pseudo-class concerns here; Trigger is a real `<button>`).
- `data-[disabled]:` selectors on `SelectItem` were **left unchanged** — Base UI's `Select.Item` still emits a plain presence `data-disabled` attribute (verified against `SelectItemDataAttributes`), identical in meaning to Radix's; the bracket-arbitrary-variant syntax already matches it, no rename needed.
- Leftover scan: `grep -n "radix-ui\|@radix-ui" src/ui/select/select.tsx` is clean.

### A real behavior regression, found and fixed: selected-value label display

Verified against the installed package's actual source (`node_modules/@base-ui/react/select/value/SelectValue.mjs`, not just the docs): when `Select.Root` has no `items` prop, `Select.Value`'s default rendering (`resolveSelectedLabel`) falls back to **stringifying the raw value**, not looking up the matching item's rendered label text the way Radix's `Select.Value` did (which always showed the selected `Item`'s `ItemText` content). Every consumer whose item label differs from its value (e.g. `{ label: "Ctrl+←→", value: "CTRL_LEFT_RIGHT" }`, or a bookmark list's title vs. its numeric id) would have silently shown the ugly raw value in the trigger instead of the label after this migration. Fixed by passing `items` (an array of `{ label, value }`) to `Select.Root` at every real call site so `Select.Value` can resolve the correct label:
- `src/ui/select/labeled-select.tsx`: `items={options}` (the component's own existing options prop).
- `src/ui/input/floating-label-input.tsx`'s `FloatingLabelSelect`: `items={options}`.
- `src/ui/form-field-item.tsx`'s `SelectFormField`: `items={options}`.
- `src/app/(home)/_feature/controls/tag-filter.tsx`'s `BookmarkListSelect`: no pre-existing options array (items are built ad hoc from a "指定なし" sentinel plus a fetched bookmark-lists query), so `items` was constructed inline: `[{ label: "指定なし", value: CLEAR_VALUE }, ...(lists?.map(l => ({ label: l.title, value: l.id.toString() })) ?? [])]`.

### Consumer sweep — `onValueChange` widens to `Value | null`

Base UI's `onValueChange` signature is `(value: Value | null, eventDetails) => void` for non-multiple selects (Radix's was always `(value: string) => void`, never `null`). This broke 3 call sites:
- `src/app/(typing)/type/_feature/tabs/setting/options/hot-key-select-fields.tsx`: one handler had an explicit `(value: string) =>` annotation that's no longer assignable; removed the annotation to let it infer contextually (matching the sibling handler right above it, which already had no annotation and compiled fine).
- `src/ui/form-field-item.tsx`'s `SelectFormField`: `field.handleChange(value)` (TanStack Form, `Updater<string>`) and the forwarded `onValueChange?.(value)` both required a plain `string`; added `if (value === null) return;` before both calls. In practice this branch is unreachable (no `SelectItem` with `value={null}` and no deselect affordance exists in any of these fixed-option selects), so this is a type-safety guard, not a real new runtime path.
- `src/ui/form-field-item.tsx`'s `FloatingLabelSelectFormField`: same fix, wrapped `field.handleChange` in an inline null-guarded callback instead of passing it directly.

## Left alone

- No consumer passes `position="item-aligned"` or `position="popper"` explicitly (grepped project-wide) — all rely on the wrapper's own default, which is why getting that default's correct `alignItemWithTrigger` value right mattered.
- The animate-in/out/fade/zoom/slide classes were already dead before this migration (see `tooltip.md`); left unchanged.

## Behavior changes

None intended — the `items` additions and `alignItemWithTrigger={false}` default are specifically there to *preserve* the prior visual/label behavior, not change it. The null-guards in `form-field-item.tsx` are unreachable in current usage.

## Verify by hand

- Open every select in the app (hot-key settings, word-display settings, bookmark-list filter dropdown, any form field using `SelectFormField`/`FloatingLabelSelect`) and confirm the trigger shows the **label text**, not the raw stored value, both on initial load and after changing the selection.
- Confirm the dropdown still positions like a normal anchored popover (not overlapping/aligned-over the trigger) — this is the `alignItemWithTrigger={false}` default doing its job.
- Change the bookmark-list filter to "指定なし" and confirm it clears the filter and the trigger shows "指定なし", not `__clear__`.
