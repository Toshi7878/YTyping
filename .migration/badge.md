# badge

2026-10-06, transformation engine (legacy `new-york` style). Clean migration, no behavior change.

## Changed

- `src/ui/badge.tsx`: replaced the manual `asChild ? SlotPrimitive.Slot : "span"` idiom with `useRender` + `mergeProps` from `@base-ui/react/use-render` / `@base-ui/react/merge-props`, per the worked example (Badge is a non-button polymorphic component, not a candidate for the real Button primitive). `data-slot`/`className` cast to `React.ComponentProps<"span">` before `mergeProps` to satisfy excess-property checking on the `data-*` key.
- Leftover scan: `grep -n "radix-ui\|@radix-ui" src/ui/badge.tsx` is clean.

## Left alone

- No consumer currently passes `asChild` to `Badge` (verified by grepping every `<Badge` call site across `src`), so there was no call-site sweep to do. The `render` prop is available for future use.

## Behavior changes

None.

## Verify by hand

- Render a few badge variants/sizes and confirm styling is unchanged.
