# checkbox

2026-10-06, transformation engine (legacy `new-york` style). Clean migration, no behavior change.

## Changed

- `src/ui/checkbox/checkbox.tsx`: `radix-ui` -> `@base-ui/react/checkbox`. 1:1 `Root`/`Indicator`. `data-[state=checked]:` -> `data-checked:` in both `Checkbox`'s own className and `CheckboxListItem`'s inline override. Root now renders `<span>` (Radix rendered `<button>`), so `disabled:*` -> `data-disabled:*`.
- Leftover scan: `grep -n "radix-ui\|@radix-ui" src/ui/checkbox/checkbox.tsx` is clean.

## Left alone

- `has-aria-checked:border-primary` on the `CheckboxListItem` label — unaffected, Base UI still sets `role="checkbox"` + `aria-checked` correctly regardless of the underlying element.
- No consumer passes `checked="indeterminate"` (grepped project-wide); `CheckboxCardGroup`'s `onCheckedChange: (checked: boolean) => void` call-site type stays assignable to Base UI's two-arg signature per the callback-signature rule.
- `TooltipWrapper ... asChild` inside `CheckboxListItem` left for the Tooltip migration pass.

## Behavior changes

None.

## Verify by hand

- Toggle a checkbox and a `CheckboxListItem`/`CheckboxCardGroup` row; confirm the check icon and border/background colors still update.
- Toggle a disabled checkbox; confirm it's dimmed and non-interactive.
