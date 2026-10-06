# dialog

2026-10-06, transformation engine (legacy `new-york` style). Clean part mapping; one custom `disableOutsideClick` prop had to move from Content to Root.

## Changed

- `src/ui/dialog.tsx`: `radix-ui` -> `@base-ui/react/dialog`. `Overlay` -> `Backdrop`, `Content` -> `Popup` (centered modal, no `Positioner` — confirmed via `overlays.md`). `data-[state=open|closed]:` -> `data-open:`/`data-closed:` on both `Backdrop` and `Popup`.
- `DialogClose`'s resting style (`data-[state=open]:bg-accent data-[state=open]:text-muted-foreground`): Base UI's `Dialog.Close` has **no** open/closed data attribute at all (verified against `DialogCloseDataAttributes.d.ts` — only `data-disabled`). Since `Close` only ever renders while the dialog is mounted (i.e. open or animating-closed), this conditional styling was always effectively "on" whenever visible; made it unconditional (`bg-accent text-muted-foreground`) rather than inventing a data-attribute dependency that doesn't exist. Flagging the judgment call rather than asserting certainty about Radix's exact prior propagation behavior.
- `disableOutsideClick` (a custom prop, previously implemented via `onPointerDownOutside={... ? (e) => e.preventDefault() : undefined}` on Content) is **removed from `DialogContent`**. Base UI's dismiss-interception model moved this concern to the Root entirely, and Root ships a declarative shortcut for exactly this case: `disablePointerDismissal` (boolean, default `false`) — no manual `eventDetails.reason` branching needed. `DialogWithContent` now accepts `disablePointerDismissal` and forwards it to the inner `Dialog` (Root); plain `DialogContent` no longer has an outside-click-blocking prop at all (it never belonged there — Root is the only place this can live under Base UI).
- Leftover scan: `grep -n "radix-ui\|@radix-ui" src/ui/dialog.tsx` is clean.

### Consumer sweep

- `src/app/user/[id]/_features/report-dialog.tsx`: `<DialogContent disableOutsideClick>` -> moved to `<Dialog ... disablePointerDismissal>` (the sibling Root element already in scope).
- `src/app/edit/_feature/map-table/line-option-dialog.tsx`: `<DialogWithContent disableOutsideClick={true}>` -> `<DialogWithContent disablePointerDismissal>` (same component, new prop name, now forwarded correctly to Root internally).
- `asChild` -> `render` on every `DialogTrigger`: `lists-popover.tsx`, `warning-dialog.tsx`, `important-notice-form.tsx`, `bookmark-lists/list.tsx` (render target is a `DropdownMenuItem`, which renders a `<div>`, not a button — `nativeButton={false}` set explicitly here, the only Dialog trigger in this sweep that needed it), `report-actions.tsx` (4 sites), `report-dialog.tsx`. Every other site renders this project's own real-`<button>` component, so `nativeButton` stayed at its default (`true`).

## Left alone

- No consumer uses `onOpenAutoFocus`/`onCloseAutoFocus`/`onEscapeKeyDown`/`onInteractOutside` on `DialogContent` (grepped project-wide) beyond the one `disableOutsideClick` case already handled.
- The animate-in/out/fade/zoom/slide classes were already dead before this migration (see `tooltip.md`); left unchanged.

## Behavior changes

None intended.

## Verify by hand

- Open every dialog (bookmark-list create/edit, warning history, important-notice create, report actions BAN/warn/dismiss/unban, report-this-user) and confirm trigger click, Escape-to-close, and the close (X) button all work.
- On the report-this-user dialog and the line-option dialog: click outside the dialog while it's open and confirm it does **not** close (the `disablePointerDismissal` cases).
- Click "編集" from the bookmark-list dropdown menu and confirm the dialog opens correctly from that non-button trigger.
