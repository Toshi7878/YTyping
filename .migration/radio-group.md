# radio-group

2026-10-06, transformation engine (legacy `new-york` style). Required making the wrapper generic to preserve type safety; otherwise a clean migration.

## Changed

- `src/ui/radio-group/radio-group.tsx`: `radix-ui` -> `@base-ui/react/radio-group` (group) + `@base-ui/react/radio` (items). Base UI splits what Radix called one `RadioGroup` namespace into a callable `RadioGroup` (group) and a separate `Radio` namespace (`Radio.Root`/`Radio.Indicator`) for items. `RadioGroupItem`, `RadioCard`, and `RadioButton` all moved from `RadioGroupPrimitive.Item` to `RadioPrimitive.Root`. `data-[state=checked]:` -> `data-checked:` everywhere (13 occurrences across `radioGroupItemVariants`'s state and all 12 variants of `radioCardVariants`). `Radio.Root` renders `<span>` (Radix rendered `<button>`), so `disabled:*` -> `data-disabled:*` on `radioGroupItemVariants`.
- **Generics**: Base UI's `RadioGroup`/`Radio.Root` are generic over `Value` (`<Value>(props: ...Props<Value>) => JSX.Element`), not `ForwardRefExoticComponent`s like Radix's were. A first pass using plain `React.ComponentProps<typeof RadioGroupPrimitive>` (no type argument) collapsed `Value` to `unknown`, which broke 4 unrelated call sites' `onValueChange` handlers (contravariance: a handler typed for a specific string-literal union isn't assignable where `unknown` is expected). Fixed by making `RadioGroup`, `RadioGroupItem`, `RadioCard`, and `RadioButton` themselves generic over `Value` (default `unknown`), using the primitives' own `XPrimitive.Props<Value>` / `XPrimitive.Root.Props<Value>` namespace types instead of `React.ComponentProps`.
- `src/ui/radio-group/labeled-radio-group.tsx`: `LabeledRadioItem`/`LabeledRadioGroup` made generic over `Value` (default `string`) for the same reason — a non-generic `RadioGroup<string>` instantiation broke every caller whose `onValueChange` is typed to its own string-literal union (e.g. `"smooth" | "instant"`). `key={item.value}` -> `key={String(item.value)}` since `item.value` is no longer guaranteed to be a React-key-safe type under a generic `Value`.
- `src/app/(typing)/type/_feature/tabs/setting/options/word-scroll-fields.tsx`: `items` array had its type widened by inference to `{ label: string; value: string }[]`, which no longer matched the now-correctly-inferred `{ label: string; value: "smooth" | "instant" }[]` the component expects; added an explicit type annotation to narrow it back to the literal union.
- Leftover scan: `grep -n "radix-ui\|@radix-ui" src/ui/radio-group/radio-group.tsx src/ui/radio-group/labeled-radio-group.tsx` is clean.

## Left alone

- `RadioButton`'s visual styling (via `buttonVariants`) has no `data-checked:*` override of its own (it relies only on default button hover/variant styles) — this is unchanged from before the migration, not something this pass introduced or was asked to redesign.

## Behavior changes

None functional. The generic-typing fix is a type-safety improvement (callers now get real literal-union checking on `value`/`onValueChange` instead of effectively `any`), not a runtime behavior change.

## Verify by hand

- Exercise every `RadioGroup`/`LabeledRadioGroup` consumer (word-scroll animation toggle, view-mode switch, input-mode radio cards, timeline result-type filter) and confirm selection still works and styling updates correctly.
- Tab/arrow-key through a radio group and confirm focus/selection behaves the same as before.
