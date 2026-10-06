# switch

2026-10-06, transformation engine (legacy `new-york` style). Clean migration, no behavior change.

## Changed

- `src/ui/switch.tsx`: `radix-ui` -> `@base-ui/react/switch`. 1:1 `Root`/`Thumb` part mapping. `data-[state=checked]:` / `data-[state=unchecked]:` -> `data-checked:` / `data-unchecked:` on both Root and Thumb. Base UI's `Switch.Root` renders a `<span>` (Radix rendered `<button>`), which kills the `disabled:*` Tailwind pseudo-class variant; replaced with `data-disabled:*`.
- Leftover scan: `grep -n "radix-ui\|@radix-ui" src/ui/switch.tsx` is clean.

## Left alone

- `src/ui/form-field-item.tsx`'s `SwitchFormField` passes `onCheckedChange={field.handleChange}` (a single-arg `(value: boolean) => void`). Base UI's `onCheckedChange` signature gained a second `eventDetails` argument, but a single-arg handler stays type-safe per the callback-signature rule, so no change was needed there.

## Behavior changes

None.

## Verify by hand

- Toggle a switch with mouse and keyboard (Space); confirm the thumb slides and the track color changes.
- Toggle a disabled switch; confirm it's visually dimmed and non-interactive.
