# alert-dialog

2026-10-06, transformation engine (legacy `new-york` style). `Action` has no Base UI primitive at all; composed it from `Close` instead. Last of the 18 primitives — `radix-ui` removed from `package.json` after this.

## Changed

- `src/ui/alert-dialog.tsx`: `radix-ui` -> `@base-ui/react/alert-dialog`. This package re-exports most parts straight from `@base-ui/react/dialog` (`Backdrop`, `Close`, `Description`, `Popup`, `Portal`, `Title`, `Viewport`) and only defines its own `Root`/`Trigger`/`Handle` — confirmed via the package's own `index.parts.d.ts`. `Overlay` -> `Backdrop`, `Content` -> `Popup`. This file already used `data-closed:`/`data-open:` presence-attribute classes before this migration started (apparently a partial prior attempt, or deliberately pre-written this way) — unlike every other overlay component in this codebase — so no data-attribute renames were needed here.
- **`Cancel` -> `Close`** (direct rename, confirmed in `overlays.md`'s mapping table).
- **`Action` has no Base UI counterpart at all** — verified by the package's actual exports, not just the docs: there is no `AlertDialogAction`/`Action` export anywhere in `@base-ui/react/alert-dialog`. Per the migration skill's explicit guidance ("Action -> (no primitive): wrapper renders a styled button; close after the action via ... composing AlertDialog.Close and running the action in onClick"), `AlertDialogAction` now composes `AlertDialogPrimitive.Close` instead, with the caller's `onClick` (the actual action) passed straight through via `...props`. This is a 1:1 behavioral match: Radix's `Action` always closed the dialog after its handler ran (no `onSelect`-style cancel escape hatch existed for it), which is exactly what composing `Close` does.
- Leftover scan: `grep -n "radix-ui\|@radix-ui" src/ui/alert-dialog.tsx` is clean.

### Consumer sweep

- `src/ui/confirm-dialog.tsx` (the only consumer, project-wide) already used plain `onClick` on both `AlertDialogAction` and `AlertDialogCancel` (never `onSelect` — that's a Menu-family concept, not Dialog-family) and a single-arg `onOpenChange={(open) => ...}` handler (still assignable under the two-arg Base UI signature). **No call-site changes were needed.**

## Left alone

- Radix alert-dialog focuses `Cancel` by default; Base UI's `Popup` focuses the first tabbable element instead (per `overlays.md`: "To preserve Radix behavior pass `initialFocus={cancelRef}`"). `confirm-dialog.tsx` doesn't currently need a specific initial-focus target (Cancel and Action are the only two tabbable elements, order is preserved), so this was left unpatched rather than threading a new ref through for a behavior difference with no visible symptom today. Flagging per the skill's "flag, don't silently patch" rule.
- The animate-in/out/fade/zoom/slide classes were already dead before this migration (see `tooltip.md`); left unchanged (and, as noted above, this file already used the correct presence-attribute spelling regardless).

## Behavior changes

Flagged, not patched: initial focus on open may land on a different element (first tabbable, not necessarily Cancel) than it did under Radix. No visible symptom in the current single consumer.

## Verify by hand

- Trigger the confirm dialog (used for destructive actions like retry/reset) and confirm Cancel/Confirm both work and close the dialog, and that `variant="destructive"`/`"warning"` styling still renders correctly on the confirm button.
- Tab through the dialog on open and sanity-check focus starts somewhere reasonable.

---

With this component migrated, the whole-project sweep is complete. The `radix-ui` package was removed from `package.json`/`pnpm-lock.yaml` (`pnpm remove radix-ui`) and `grep -rn "radix" src` now returns zero hits project-wide. `src/ui/data-list.tsx` (a hand-rolled `Slot`/`asChild` wrapper unrelated to any named primitive, found only once this sweep was already under way) was migrated alongside this batch to the same `useRender`/`mergeProps` idiom as `badge.tsx` — see `.migration/data-list.md`. `pnpm build` passes cleanly on the final state.
