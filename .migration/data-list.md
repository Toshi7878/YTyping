# data-list

2026-10-06, transformation engine. Found mid-sweep (not part of the original 18-primitive inventory — it has no corresponding shadcn/Radix-named component, just a hand-rolled `Slot`/`asChild` wrapper) while grepping for leftover `radix-ui` imports before removing the dependency.

## Changed

- `src/ui/data-list.tsx`: the manual `asChild ? SlotPrimitive.Slot : "dl"` idiom -> `useRender` + `mergeProps`, same pattern as `badge.tsx`'s migration (non-button polymorphic wrapper, not a candidate for a real primitive). Unlike `badge.tsx`, this component's original API explicitly supported a forwarded `ref` (`ref?: React.Ref<React.ComponentRef<"dl">>`) — `useRender`'s `ref` is a dedicated top-level parameter of the hook call, separate from the `props` object passed to `mergeProps`; forgetting to forward it would have silently dropped any ref a caller passed, so it's threaded through explicitly (`useRender({ render, ref, props, ... })`).
- Leftover scan: `grep -n "radix-ui\|@radix-ui" src/ui/data-list.tsx` is clean.

## Left alone

- No consumer currently passes `asChild` or `ref` to `DataList` (grepped project-wide), so there was no call-site sweep to do. `render`/`ref` are available for future use.

## Behavior changes

None.

## Verify by hand

- Render a `DataList` with a few `DataListItem`/`DataListLabel`/`DataListValue` children (e.g. the user profile card) and confirm layout/orientation is unchanged.
