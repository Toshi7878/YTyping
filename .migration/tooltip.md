# tooltip

2026-10-06, transformation engine (legacy `new-york` style). Structural change (new Positioner layer), plus a dismiss-callback API change at the wrapper's one affected call site.

## Changed

- `src/ui/tooltip.tsx`: `radix-ui` -> `@base-ui/react/tooltip`. `Content` is now split `Portal > Positioner > Popup`: `side`/`align`/`alignOffset`/`sideOffset` moved from Content onto the new `Positioner` (`TooltipContent` now destructures and forwards them explicitly — declare/destructure/forward, per the migration skill's positioner checklist, so they don't silently fall through onto `Popup`). `--radix-tooltip-content-transform-origin` -> `--transform-origin`. The `data-[state=delayed-open]:*` duplicate selectors were dropped (Base UI has no `delayed-open` state value; `data-open:` alone already covers it). Arrow kept its existing hand-written rotate/translate classes unchanged (this project doesn't use the `cn-tooltip-arrow` design-token hooks the canonical base registry assumes, so that golden shape doesn't apply here).
- `TooltipProvider`: `delayDuration` prop -> `delay` (Base UI rename); its one call site (`src/app/layout.tsx`) updated.
- `TooltipTrigger`/`Tooltip` (Root): Radix's `Tooltip.Root` accepted its own `delayDuration` override; Base UI's `Tooltip.Root` has **no** delay-related prop at all — delay lives only on `Provider` and `Trigger`. `TooltipWrapper`'s `delayDuration` prop now forwards to `TooltipTrigger`'s `delay`, not to `Tooltip`/Root.
- `TooltipWrapper`'s `asChild` -> internally translated to `TooltipTrigger`'s `render` (`render={children as ReactElement}`, with `children` on the Trigger itself left `undefined` so there's no duplicate-content merge). **No `nativeButton` flag was added**: unlike Button/Switch/Checkbox/Radio, Base UI's `Tooltip.Trigger` props have no `nativeButton` field at all (verified against `node_modules/@base-ui/react/tooltip/trigger/TooltipTrigger.d.ts`) — it doesn't need to know whether the rendered target is a real button.
- Leftover scan: `grep -n "radix-ui\|@radix-ui" src/ui/tooltip.tsx` is clean.

### Consumer sweep — dismiss-callback API change

`src/app/(typing)/type/_feature/tabs/ranking/ranking-card.tsx` was the only call site using `onPointerDownOutside` (`(event) => event.preventDefault()`, unconditionally keeping the tooltip open since it's externally open-controlled by `openPopoverIndex`). Per `overlays.md`, Radix's per-interaction dismiss callbacks have no 1:1 Base UI prop — they're replaced by checking `eventDetails.reason` inside `onOpenChange` and calling `eventDetails.cancel()`. Rather than leak that mechanism into every call site, `TooltipWrapper` gained a new boolean prop, `disableOutsidePressDismiss`, that does this internally; the call site was updated from the event-callback shape to the boolean flag.

No consumer uses `disableHoverableContent`/`skipDelayDuration` (grepped project-wide: 0 hits), so that behavior delta (dropped with no equivalent) doesn't need flagging at any real call site, though it's worth knowing: Base UI's per-tooltip `disableHoverablePopup` exists on `Root` if ever needed, but isn't wired through this wrapper yet.

## Left alone

- The enter/exit animation classes (`data-open:fade-in-0`, `animate-in`, `animate-out`, `slide-in-from-*`, etc.) were **already dead before this migration**, for the same reason as `accordion.md`: they depend on the `tw-animate-css` package, which is installed but never `@import`ed into `src/theme/globals.css`. Confirmed project-wide (`grep -rn "tw-animate-css" src` — zero hits). This is not specific to tooltip; it affects every Radix-derived overlay component in this codebase (popover, hover-card, dialog, sheet, select, dropdown-menu, alert-dialog all use the same dead utility classes) and will be called out again, not re-investigated, in each of those components' reports. Left the literal class strings unchanged.

## Behavior changes

None functional. `disableOutsidePressDismiss` is a narrower, more explicit replacement for the old unconditional `event.preventDefault()`, not a new capability.

## Verify by hand

- Hover over several tooltip-wrapped elements (map cards, header icons, sheet triggers) and confirm the tooltip appears near the trigger on the correct side with correct offset.
- Check the `TooltipProvider delay={600}` group-delay behavior still works (hovering a second tooltip shortly after closing the first should open it without the full delay).
- On the ranking card popover-style tooltip, click outside it while it's open via `openPopoverIndex` and confirm it does **not** dismiss (the `disableOutsidePressDismiss` path).
