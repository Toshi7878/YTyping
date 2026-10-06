# popover

2026-10-06, transformation engine (legacy `new-york` style). Structural change (Positioner layer) plus a from-scratch replacement for the dropped `Anchor` part.

## Changed

- `src/ui/popover.tsx`: `radix-ui` -> `@base-ui/react/popover`. `Content` splits into `Portal > Positioner > Popup`; `side`/`align`/`alignOffset`/`sideOffset` moved to `Positioner`, declared/destructured/forwarded explicitly in `PopoverContent`. `--radix-popover-content-transform-origin` -> `--transform-origin`. `onOpenAutoFocus={(event) => event.preventDefault()}` -> `initialFocus={false}` (hardcoded default on `Popup`, overridable via the `{...props}` spread that follows it).
- **`PopoverAnchor` has no Base UI equivalent** (`Anchor` part was dropped; Base UI's Positioner instead takes an `anchor` prop — `Element | RefObject<Element|null> | ...`, defaulting to the trigger). Since `PopoverAnchor` and `PopoverContent` live in different parts of the consumer's JSX tree but both need to agree on the same anchor element, `Popover` (Root) now provides a `React.createContext`-held ref (`PopoverAnchorContext`); `PopoverAnchor` writes to it (via a plain `ref` callback for the no-`asChild` case, or `React.cloneElement(children, { ref })` for the `asChild` case — mirroring the old Radix Slot behavior of attaching to the child with no extra DOM wrapper), and `PopoverContent`'s `Positioner` reads it and passes `anchor={anchorRef}`. This is a custom solution (not copied from an official Base UI registry wrapper); the migration skill's own doc-validation notes flagged this part as needing confirmation, so treat it as reviewable, not golden.
- Leftover scan: `grep -n "radix-ui\|@radix-ui" src/ui/popover.tsx` is clean.

### Consumer sweep

- `--radix-popper-anchor-width` -> `--anchor-width` at its 2 call sites (`src/app/(home)/_feature/controls/keyword.tsx`, `src/app/(admin)/admin/important-notices/_features/user-multi-select.tsx`) — both are combobox-style `PopoverAnchor asChild` wrapping an `<Input>`, sizing the popup content to the anchor's width.
- `PopoverTrigger asChild` -> `render` at all 5 real call sites: `src/shared/map/bookmark/lists-popover.tsx`, `src/app/_layout/header/navs/right-menus/new-map-popover.tsx`, `src/app/(typing)/type/_feature/tabs/setting/popover.tsx`, `src/app/(typing)/ime/_feature/memu/setting-popover.tsx`, `src/app/timeline/_feature/controls/filter-popover.tsx`. Every rendered target is one of this project's own `Button`-family components (already real `<button>`s after the button.tsx migration), so `nativeButton` was left at its default (`true`) everywhere — none needed `nativeButton={false}`.
- `onOpenAutoFocus={() => inputRef.current?.focus()}` (`new-map-popover.tsx`) -> `initialFocus={inputRef}` — Base UI's `initialFocus` accepts a ref directly, which is a more direct translation of the intent than the old event-callback shape.
- `onInteractOutside` (`src/app/(typing)/ime/_feature/memu/setting-popover.tsx`) checked whether the outside-press target was inside `#reset-setting-modal-overlay` and `preventDefault()`'d if so, to avoid closing the settings popover from behind a nested confirm dialog. Moved into `Popover`'s own `onOpenChange`: check `eventDetails.reason === "outside-press"`, inspect `eventDetails.event.target`, call `eventDetails.cancel()`. The existing async `handleOpenChange(open: boolean)` side-effect function was kept as-is and just called from inside the new inline handler after the cancel check.

## Left alone

- `modal={true}` on `src/shared/map/bookmark/lists-popover.tsx`'s `Popover` has no explicit `Popover.Close` inside its `PopoverContent`. Base UI's docs note that `modal` focus-trapping works best with a `Close` element inside the popup; this project relies on Escape/outside-dismiss instead, same as it did under Radix. Not a regression, but flagging per the docs' own recommendation in case it's ever revisited.
- The animate-in/out/fade/zoom/slide classes on `PopoverContent` were already dead before this migration (see `tooltip.md`); left unchanged.

## Behavior changes

None expected. `initialFocus={inputRef}` is a closer match to the original intent than the callback it replaced.

## Verify by hand

- Open every popover (bookmark lists, new-map, typing settings, IME settings, timeline filter, keyword/user combobox) and confirm positioning, width (combobox anchor-width cases), and dismiss-on-outside-click/Escape all still work.
- For the IME settings popover: open a nested reset-confirmation modal from inside it, click outside the settings popover while that confirm modal is open, and confirm the settings popover does **not** close underneath it.
- For the new-map popover: open it and confirm the URL input receives focus automatically.
