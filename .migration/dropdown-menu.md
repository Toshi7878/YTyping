# dropdown-menu

2026-10-06, transformation engine (legacy `new-york` style). The biggest structural change so far (primitive rename + canonical menu part mapping); large consumer surface for `asChild` and `onSelect`.

## Changed

- `src/ui/dropdown-menu.tsx`: `radix-ui`'s `DropdownMenu` -> `@base-ui/react/menu`'s `Menu` (RENAMED, per `universal-patterns.md`; public `DropdownMenu*` wrapper names kept). Canonical part mapping applied: `Content` -> `Portal > Positioner > Popup` (side/align/sideOffset/alignOffset declared/destructured/forwarded to `Positioner`); `Label` -> `GroupLabel`; `ItemIndicator` -> split into `CheckboxItemIndicator` / `RadioItemIndicator` depending on parent item type; `Sub` -> `SubmenuRoot`; `SubTrigger` -> `SubmenuTrigger`; `SubContent` -> `Positioner > Popup` (no self-`Portal`: the one real consumer already wraps `DropdownMenuSubContent` in its own `<DropdownMenuPortal>`, matching the original Radix composition, so adding an internal Portal would have double-nested it).
- CSS vars: `--radix-dropdown-menu-content-available-height` -> `--available-height`; `--radix-dropdown-menu-content-transform-origin` -> `--transform-origin` (both Content and SubContent).
- `DropdownMenuSubTrigger`'s open-state styling: `data-[state=open]:bg-primary` / `data-[state=open]:text-primary-foreground` -> `data-popup-open:bg-primary` / `data-popup-open:text-primary-foreground` (there was no `data-popup-open`-equivalent class under Radix; this is a renamed presence attribute, per `wrapper-shapes.md`'s SubTrigger note).
- Leftover scan: `grep -n "radix-ui\|@radix-ui" src/ui/dropdown-menu.tsx` is clean.

### Consumer sweep

- **`asChild` -> `render`** on every real `DropdownMenuTrigger`: `src/app/_layout/header/navs/left-menus.tsx`, `.../right-menus/auth/sign-in-menu.tsx`, `.../right-menus/hamburger-menu.tsx`, `.../right-menus/user-menu.tsx`, `src/app/user/[id]/_features/bookmark-lists/list.tsx`. Every rendered target is this project's own `Button` component (a real `<button>` since the button.tsx migration), so `nativeButton` was left at its default (`true`) everywhere.
- **`onSelect` -> `onClick` (+ `closeOnClick`)** at every real `DropdownMenuItem`/checkbox-item call site (grepped `onSelect` project-wide and excluded the unrelated native-`<input>`/`<textarea>` `onSelect` events in `map-table.tsx` and `line-input.tsx`, and the custom non-menu `onSelect` prop in `keyword.tsx`'s own component):
  - `src/app/_layout/header/navs/right-menus/theme-dropdown-sub-menu.tsx`: had both `onSelect={(e) => e.preventDefault()}` (keep menu open) *and* a separate `onClick` (the actual theme-change action) on the same item — Radix fired both independently; Base UI only has one `onClick`. Merged into `closeOnClick={false}` + the existing `onClick`.
  - `src/app/user/[id]/_features/bookmark-lists/list.tsx`: one item had `onSelect={(e) => e.preventDefault()}` with no other handler (it's a Dialog trigger composed as the item's render target) -> `closeOnClick={false}`, no `onClick` needed. The other had `onSelect={handleDelete}` with no `preventDefault` (closes after, like Radix's default) -> plain `onClick={handleDelete}`.
  - `src/app/_layout/header/navs/right-menus/auth/auth-dropdown-items.tsx`: `onSelect={async () => {...}}` (no `preventDefault`, closes after) -> `onClick={async () => {...}}`, same body.

## Left alone

- **Flagged, not patched** (per the migration skill's explicit instruction): `closeOnClick` now defaults to `false` on `DropdownMenuCheckboxItem`/`DropdownMenuRadioItem` (Radix closed the menu on select by default). No consumer in this project currently uses `DropdownMenuCheckboxItem`/`DropdownMenuRadioItem` (grepped project-wide: 0 hits), so this behavior delta has no live call site to break today, but will matter the first time someone adds one.
- The animate-in/out/fade/zoom/slide classes on `Content`/`SubContent` were already dead before this migration (see `tooltip.md`); left unchanged.

## Behavior changes

None at any real call site beyond the flagged `closeOnClick` default noted above (currently unexercised).

## Verify by hand

- Open every dropdown menu in the header (left nav "Menu", sign-in, hamburger, user menu) and the bookmark-list row menu; confirm trigger click, keyboard nav (arrow keys + Enter), and item hover/focus styling all work.
- On the theme submenu: open it, click a theme, and confirm the menu stays open (not closed) while the theme actually changes.
- On the bookmark-list row menu: click "編集" and confirm it opens the edit dialog without the dropdown menu interfering; click "削除" and confirm it deletes and closes.
