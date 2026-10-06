# sheet

2026-10-06, transformation engine (legacy `new-york` style). Same underlying primitive as `dialog.tsx` (Radix never had a separate Sheet primitive; this project's "Sheet" is a differently-styled Dialog, same as shadcn's own convention) — same part mapping applies, plus a `forceMount` -> `keepMounted` relocation that actually matters functionally this time.

## Changed

- `src/ui/sheet.tsx`: `radix-ui`'s `Dialog` -> `@base-ui/react/dialog`'s `Dialog` (same package as `dialog.tsx`; Sheet is just a different visual treatment of the same primitive on both sides). `Overlay` -> `Backdrop`, `Content` -> `Popup`. `data-[state=open|closed]:` -> `data-open:`/`data-closed:` throughout — including the per-side slide classes and, importantly, `data-closed:hidden`, which is **not** cosmetically dead like the slide/fade utilities: it's a plain, real Tailwind class that must actually hide the panel while closed/closing, so getting this one specific rename right matters even though the slide/fade animations around it are inert (see Left alone).
- `SheetClose`'s `data-[state=open]:bg-secondary`: same situation as `dialog.tsx`'s `DialogClose` (no open/closed data attribute exists on Base UI's `Dialog.Close`) — made unconditional (`bg-secondary`), same reasoning.
- **`forceMount` -> `keepMounted`, relocated from `Content` to `Portal`.** Unlike `dialog.tsx` (which never used `forceMount`), this prop is actually exercised here: `SheetContent`'s own `forceMount`/`SheetContentProps` plumbing passed it to both `SheetPortal` and `SheetPrimitive.Content`. Base UI's `Popup` has **no** `keepMounted` prop at all (verified: only `Dialog.Portal` has it) — passing it to `Popup` would have been a silent no-op (or a type error once `Omit<..., "forceMount">`'s workaround was removed). `SheetContentProps`'s `forceMount?: true` -> `keepMounted?: boolean`, now forwarded only to `SheetPortal`.
- Leftover scan: `grep -n "radix-ui\|@radix-ui" src/ui/sheet.tsx` is clean.

### Consumer sweep

- `forceMount` -> `keepMounted` at all 3 real `SheetContent` call sites that used it: `src/app/(typing)/type/_feature/typing-card/line-result/line-result-sheet.tsx` (×2), `src/app/(typing)/type/_feature/typing-card/playing/line-practice/line-practice-sheet.tsx`.
- `asChild` -> `render` on every `SheetTrigger`: `active-users-sheet.tsx`, `line-result-sheet.tsx` (render target is a plain `React.ReactNode` prop, cast to `ReactElement`), `notification-sheet.tsx`. All render this project's own real-`<button>` `Button` component, so `nativeButton` stayed at its default.

## Left alone

- The per-side slide-in/out and fade/zoom animation classes were already dead before this migration (tw-animate-css not wired into `globals.css`, see `tooltip.md`); their literal class names are unchanged. Only the `data-[state=...]` -> `data-open:`/`data-closed:` prefix was corrected, since that part is shared with the real `hidden` class and needed to be right regardless of whether the animation utilities themselves resolve to anything.

## Behavior changes

None intended — `keepMounted` relocation preserves the "stay mounted while closed" behavior the 3 call sites rely on (one for a hover-interaction sheet that needs to track mouse position even while visually closed, two for a result sheet that keeps state warm).

## Verify by hand

- Open/close every sheet (active users, notification bell, end-of-game detailed result, practice-mode line list) and confirm the panel slides in from the correct side and actually disappears (not just stuck transparent) when closed.
- For the 3 `keepMounted` sheets specifically: confirm their content stays mounted in the DOM while closed (check devtools), matching prior behavior.
