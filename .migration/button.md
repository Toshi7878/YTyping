# button

2026-10-06, transformation engine (legacy `new-york` style). Migrated to the real Base UI `Button` primitive; required a consumer-side correction mid-migration (see below).

## Changed

- `src/ui/button.tsx`: dropped the manual `asChild ? SlotPrimitive.Slot : "button"` idiom and migrated to the real `@base-ui/react/button` primitive (`import { Button as ButtonPrimitive } from "@base-ui/react/button"`), per the migration skill's explicit correction: a shadcn `button.tsx` using the Slot/asChild idiom migrates to the real Button primitive, never a hand-rolled `useRender` wrapper. The project's custom `loading` prop (renders a `Loader2` spinner and force-disables the button) was preserved as-is — out of scope for a library swap; the newer shadcn convention of composing `Spinner` + `data-icon` instead of a `loading` prop was **not** applied here and should be a separate, explicit task if wanted.
- Leftover scan: `grep -n "radix-ui\|@radix-ui" src/ui/button.tsx` is clean.

### Consumer sweep — and a correction

Initially migrated every `<Button asChild><Link .../></Button>` call site to `<Button render={<Link .../>} nativeButton={false}>`. Base UI's own docs state that `Button` enforces real button semantics (`role="button"`, keyboard interaction handlers) and that links should **not** be rendered through it — a styled link-as-button should apply `buttonVariants()` directly to the `<Link>`/`<a>` instead. All Link call sites below were corrected to that pattern; `Button`+`render` was kept only where the rendered target is an actual button element.

Files changed (Link-as-button -> `buttonVariants()` applied directly to `<Link>`, `Button` import replaced with `buttonVariants` where `Button` was otherwise unused in the file):
- `src/app/_layout/header/navs/left-menus.tsx`
- `src/app/_layout/header/navs/right-menus/new-map-popover.tsx` (`CreateMapBackUpButton`; dropped the meaningless `type="button"` that was being spread onto an anchor)
- `src/app/(menus)/bookmarks/[id]/page.tsx`
- `src/app/user/[id]/_features/user-profile-card.tsx`
- `src/app/user/[id]/_features/play-summary/summary.tsx` (3 sites)
- `src/ui/pagination.tsx`'s `PaginationLink` — rewritten to a plain `<a>` styled with `buttonVariants()`, since it always rendered an anchor.
- `src/ui/icon-button.tsx`'s `EditIconLinkButton` — rewritten to a plain `<Link>` styled with `buttonVariants()`; its prop type no longer inherits `IconButtonProps` (that type was never applicable to a link in the first place).

Files where `Button`+`render` was kept (rendered target is a real button, not a link):
- `src/ui/alert-dialog.tsx`'s `AlertDialogAction`/`AlertDialogCancel` — render `AlertDialogPrimitive.Action`/`Cancel`, which render native `<button>` elements. These two call sites will be revisited (import source only, not structure) when `alert-dialog.tsx` itself is migrated off `radix-ui`.

Type-only fixups:
- `src/ui/icon-button.tsx`: `IconButtonProps` no longer omits `"asChild"` (the key doesn't exist on the new Button props, so omitting it was a no-op either way, but it's misleading to leave it) — changed to `Omit<ComponentProps<typeof Button>, "children" | "type">`.
- `src/ui/like-button/like-button.tsx`: same `Omit<..., "asChild">` cleanup; also `buttonRef` (passed through to `Button`'s `ref`) was typed `useRef<HTMLButtonElement | null>`, but Base UI's `Button` forwards a ref typed `HTMLElement` (it can render as a non-button via `render`). Narrowed-to-widened ref assignment doesn't typecheck, so retyped to `useRef<HTMLElement | null>`.

## Left alone

- `src/ui/button-with-kbd.tsx`, `src/ui/file-import-button.tsx`, `src/ui/like-button/*`: compose `Button` but don't themselves use `asChild`/`render`; untouched beyond the ref-typing fix above.

## Behavior changes

None expected. The link-as-button sites now render a plain `<a>`/`next/link` styled with button classes instead of a `<button>`-semantics element wrapping an anchor — this is strictly more correct (no nested interactive-role weirdness), not a behavior regression.

## Verify by hand

- Click every converted link-styled-as-button (header nav links, "戻る" links, pagination, settings edit icon, play-summary links) and confirm navigation still works and hover/focus styling is unchanged.
- Tab through a page with several buttons and confirm focus rings and disabled/loading states still render correctly.
- Trigger a `loading` button and confirm the spinner shows and the button is disabled.
