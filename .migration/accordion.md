# accordion

2026-10-06, transformation engine (legacy `new-york` style). Clean migration; also removed a now-invalid `type`/`collapsible` pair at the one real call site.

## Changed

- `src/ui/accordion.tsx`: `radix-ui` -> `@base-ui/react/accordion`. `Content` -> `Panel`. `disabled:*` on `AccordionTrigger` -> `aria-disabled:*` (Base UI surfaces the trigger's disabled state as `aria-disabled`, not the `disabled` attribute). CSS var `--radix-accordion-content-height` -> `--accordion-panel-height` on the inner height div (already correctly placed on the inner div, not the Panel itself, matching the target shape).
- `src/app/(menus)/api-docs/page.tsx`: `<Accordion type="single" collapsible>` -> `<Accordion>` — Base UI has no `type`/`collapsible` props; single-select-with-collapse is simply the default behavior (the only real `<Accordion>` usage in the app, grepped project-wide).
- Leftover scan: `grep -n "radix-ui\|@radix-ui" src/ui/accordion.tsx` is clean.

## Left alone

- `data-closed:animate-accordion-up data-open:animate-accordion-down` on `AccordionContent`'s className: these were **already dead** before this migration — they reference `animate-accordion-up`/`down` utilities from the `tw-animate-css` package, which is installed (`package.json` devDependency) but never `@import`ed into `src/theme/globals.css` (verified: no `tw-animate-css` reference anywhere under `src/`), so the utility classes don't exist in the compiled CSS. They are also inert for a second, independent reason on both sides: Radix exposes this as `data-state="closed"` (needs `data-[state=closed]:`, not a bare `data-closed` attribute), and Base UI's own docs confirm Accordion parts never emit `data-closed` at all (closed is styled as the *absence* of `data-open`). Left the literal strings unchanged since touching them has zero functional effect either way; flagging here rather than quietly "fixing" into working animation code, since that would be a behavior addition outside this migration's scope.

## Behavior changes

None.

## Verify by hand

- Expand/collapse accordion items on the API docs page; confirm only one item opens at a time and the chevron icon flips.
- Tab to a trigger and confirm focus ring and `aria-expanded` toggle correctly.
