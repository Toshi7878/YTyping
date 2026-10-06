# hover-card

2026-10-06, transformation engine (legacy `new-york` style). Primitive renamed (HoverCard -> PreviewCard internally; public wrapper names unchanged), plus a second hand-rolled Slot-based consumer migrated alongside it.

## Changed

- `src/ui/hover-card.tsx`: `radix-ui` -> `@base-ui/react/preview-card` (`import { PreviewCard as HoverCardPrimitive } from ...` — the public `HoverCard`/`HoverCardTrigger`/`HoverCardContent` names are kept, only the underlying import changes, per the migration skill's explicit note that the rename is internal-only). `Content` splits into `Portal > Positioner > Popup`; `side`/`align`/`alignOffset`/`sideOffset` moved to the new `Positioner`, declared/destructured/forwarded explicitly. `--radix-hover-card-content-transform-origin` -> `--transform-origin`.
- `src/ui/hover-extract-card.tsx`: a second, unrelated hand-rolled usage of the raw primitive (not through the `@/ui/hover-card` wrapper) that drives a fully-controlled hover card via its own custom open/close timers (`HoverExtractCard`) plus a separate `Slot`-based trigger wrapper (`HoverExtractCardTrigger`) that attaches `onPointerEnter`/`onPointerLeave` to an arbitrary child with no extra DOM wrapper. Both migrated:
  - `HoverExtractCard`: same `Portal > Positioner > Popup` restructuring; `avoidCollisions={false}` -> `collisionAvoidance={{ side: "none", align: "none", fallbackAxisSide: "none" }}` on `Positioner` (the Radix boolean-to-object conversion documented in `overlays.md`).
  - `HoverExtractCardTrigger`: the manual `Slot`/`asChild` idiom -> `useRender` + `mergeProps`, same pattern as `badge.tsx`'s migration (non-button polymorphic wrapper merging event handlers onto an arbitrary single child, no DOM wrapper added).
- Leftover scan: `grep -n "radix-ui\|@radix-ui" src/ui/hover-card.tsx src/ui/hover-extract-card.tsx` is clean.

## Left alone

- **`src/ui/hover-card.tsx` has zero consumers** (`grep -rln "from \"@/ui/hover-card\"" src` — no hits). Migrated anyway for consistency/correctness, but there was no consumer sweep to do for it.
- `src/ui/hover-extract-card.tsx`'s own 3 consumers (`src/shared/map/list/card/{base,minimum,compact}.tsx`) only ever pass a single `<Link>` child to `HoverExtractCardTrigger` with no extra props — no call-site changes were needed, the migration was entirely internal to the wrapper.
- The animate-in/out/fade/zoom/slide classes on `HoverCardContent` were already dead before this migration (see `tooltip.md`); left unchanged.

## Behavior changes

None.

## Verify by hand

- Hover over a map-list card's title/badges area and confirm the extract preview card opens below it, sized to the card's width, and closes on pointer-leave with the expected delay.
