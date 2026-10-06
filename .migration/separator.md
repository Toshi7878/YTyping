# separator

2026-10-06, transformation engine (legacy `new-york` style). Clean migration, no behavior change.

## Changed

- `src/ui/separator.tsx`: `import { Separator as SeparatorPrimitive } from "radix-ui"` -> `from "@base-ui/react/separator"`. Separator is a single callable part in Base UI (no `.Root`), so `<SeparatorPrimitive.Root>` -> `<SeparatorPrimitive>`. Dropped the `decorative` prop/default (no Base UI equivalent; Base UI's separator is always semantic `role="separator"`).
- Leftover scan: `grep -n "radix-ui\|@radix-ui" src/ui/separator.tsx` is clean.

## Left alone

- Consumer sweep found no call site passing `decorative` to `Separator`.

## Behavior changes

None. `data-[orientation=...]` selectors are unchanged on both sides (not in the data-attribute rename list).

## Verify by hand

- Render a horizontal and a vertical separator; confirm both still have the correct thickness/orientation styling.
