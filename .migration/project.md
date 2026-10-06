# project: Radix UI -> Base UI (whole project)

2026-10-06/07. Whole-project mode, transformation engine throughout (legacy `new-york` shadcn style — no `base-<style>` golden-pair registry exists for it, so every wrapper was hand-migrated against the reference tables rather than replayed from a fetched variant). All 18 original Radix-backed primitives, plus one extra found mid-sweep, migrated; dependency removed; build green.

## Scope

Started from a user request to migrate this project from Radix UI to Base UI and bring its UI components up to the current shadcn conventions, using the project's `shadcn` and `migrate-radix-to-base` skills. Confirmed up front via `npx shadcn@latest info` that the project's `components.json` was stale (pointed at `@/components/ui`/`src/styles/globals.css`, neither of which exist; real paths are `src/ui`/`src/theme/globals.css`) and fixed that as setup, alongside installing `@base-ui/react` alongside `radix-ui` (per the skill: both coexist until the last component is migrated).

## Components migrated (18 + 1), in dependency order

label, separator, switch, badge, button, checkbox, radio-group, slider (+ dual-range-slider), accordion, tabs, tooltip, popover, hover-card (+ hover-extract-card), scroll-area, dropdown-menu, select, dialog, sheet, alert-dialog, and `data-list.tsx` (a hand-rolled `Slot` wrapper with no named-primitive counterpart, found while grepping for leftover imports before removing the dependency). One `.migration/<component>.md` report per component; this file is the project-level rollup the skill asks for in whole-project mode.

## Dependency swap

- Added: `@base-ui/react@1.8.0` (alongside `radix-ui`, early).
- Removed: `radix-ui` (`pnpm remove radix-ui`, last step, after confirming `grep -rn "radix" src` returns zero hits).
- `components.json`: `aliases`/`tailwind.css` corrected to match the project's real layout (unrelated to Radix/Base UI itself, but needed for the shadcn CLI to see installed components at all).

## Cross-cutting findings (apply to more than one component)

1. **Dead animation classes, project-wide.** Every Radix-derived overlay component's `animate-in`/`animate-out`/`fade-in-0`/`fade-out-0`/`zoom-in-95`/`zoom-out-95`/`slide-in-from-*`/`slide-out-to-*` utility classes were **already non-functional before this migration started**: they come from the `tw-animate-css` package, which is an installed `devDependency` but is never `@import`ed into `src/theme/globals.css` (verified: `grep -rn "tw-animate-css" src` returns zero hits). Left as literal, unchanged strings everywhere (tooltip, popover, hover-card, dropdown-menu, select, dialog, sheet, alert-dialog) rather than "fixed" into working animations, since making them actually animate would be a feature addition outside a library-swap's scope — flagged once here instead of repeating the investigation in every report.
2. **Generic-Root primitives need care, not plain wrapper functions.** Base UI's `RadioGroup`, `Slider.Root`, and `Select.Root` are generic over `Value` with no usable default. A first pass at `radio-group.tsx` wrapped `RadioGroupPrimitive` in an ordinary (non-generic) function component — exactly the trap `select.tsx`'s own wrapper-shapes guidance warns about — which collapsed `Value` to `unknown`/`{}` and broke 4 unrelated call sites' `onValueChange` handlers via contravariance. Fixed by making the project's own wrappers generic too (`radio-group.tsx`, `labeled-radio-group.tsx`) or, where the skill explicitly prescribes it, using a **bare re-export** (`const Select = SelectPrimitive.Root`, no wrapper function at all) so each JSX call site infers its own `Value` independently (`select.tsx`). `slider.tsx`/`dual-range-slider.tsx` sidestepped the issue by pinning `Value` to the concrete `number[]` they always use, since genericity wasn't actually needed there.
3. **Links must not be rendered through `Button`.** Base UI's `Button` enforces real button semantics (role, keyboard handling), and its own docs say not to compose a link through it via `render`. An early pass converted every `<Button asChild><Link/></Button>` site to `<Button render={<Link/>}>`; corrected mid-session to apply `buttonVariants()` directly to the `<Link>`/`<a>` instead, with `Button`+`render` kept only where the rendered target is an actual button (e.g. `AlertDialogPrimitive.Action`/`Cancel` wrapped by `Button` before alert-dialog's own migration).
4. **`data-[state=open|closed]:` -> `data-open:`/`data-closed:` is easy to miss on `Popup`/`Content`, since the dead animation classes compile either way.** Caught and fixed in `popover.tsx`, `select.tsx`, `hover-card.tsx`, and `dropdown-menu.tsx` only during the final project-wide sweep, after `dialog.tsx`/`sheet.tsx` got it right from the start. Also found and fixed 3 **consumer** files styling already-migrated components with the old bracket-value selector: `pp-ranking.tsx` and `(typing)/ime/_feature/memu/setting-popover.tsx` (both `TabsTrigger` -> `data-active:`) and `result-dialog.tsx` (`RadioButton` -> `data-checked:`/`data-unchecked:`, plus a `group-data-checked/ranking-item:` rename). `src/ui/table/table.tsx`'s `data-[state=selected]:bg-muted` was confirmed unrelated (a plain `<tr>`, TanStack Table's own row-selection convention, not Radix) and left alone.
5. **A real behavior regression, not just a renaming exercise: Select's label display.** Verified against the installed package's actual source (not just docs): without an `items` prop on `Select.Root`, `Select.Value` stringifies the raw value instead of resolving the matching item's label text, unlike Radix which always showed the selected `Item`'s rendered content. Every consumer whose label differs from its value needed `items` added — see `select.md` for the 4 fixed call sites. This would have shipped as a silent, ugly regression (`"CTRL_LEFT_RIGHT"` shown in a trigger instead of `"Ctrl+←→"`) if not caught by reading the source rather than trusting the mapping tables' secondhand description.

## Consumer-side sweep (beyond individual component reports)

Every `asChild` -> `render`/`nativeButton` conversion, every `onSelect` -> `onClick`(+`closeOnClick`), every `forceMount` -> `keepMounted`, every dropped-dismiss-callback (`onPointerDownOutside`, `onInteractOutside`, `onOpenAutoFocus`) rewritten against `onOpenChange`'s `eventDetails`, and the `PopoverAnchor` part's from-scratch context-based replacement are each detailed in their respective component's `.migration/*.md`. Nothing was found that required a behavior change beyond what's flagged per-component; everything flagged was flagged rather than silently patched, per the migration skill's hard rule.

## Verification

- `pnpm typecheck` (`next typegen && tsc`): clean after every component and at the end.
- `pnpm check` (Biome): clean after every component and at the end.
- `pnpm build`: passes on the final state.
- No manual browser verification was performed in this session — the per-component "Verify by hand" checklists are for the user (or a follow-up session) to run through; this was a large, mechanical-but-judgment-heavy migration and real interaction testing (hover delays, keyboard menu navigation, focus trapping, drag behavior on sliders) is the one thing a type-check and build genuinely cannot confirm.

## Derived status: components remaining on Radix

```
grep -rn "radix-ui\|@radix-ui" src/ui --include="*.tsx"
```
→ **0 hits.** No wrappers remain on Radix.
