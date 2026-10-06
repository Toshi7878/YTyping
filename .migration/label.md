# label

2026-10-06, transformation engine (legacy `new-york` style, no golden-pair replay). Clean migration, no behavior change.

## Changed

- `src/ui/label.tsx`: dropped `radix-ui`'s `Label.Root` for a native `<label>`. No Base UI counterpart exists for Radix Label; its only behavioral extra (prevent text-selection on double-click) was already covered by the existing `select-none` class. Added a `biome-ignore lint/a11y/noLabelWithoutControl` comment: this is a generic polymorphic wrapper (used both with `htmlFor` and by nesting a control as a child, e.g. `src/ui/checkbox/checkbox.tsx`'s `CheckboxListItem`), so Biome can't statically see the association through the `...props` spread.
- Leftover scan: `grep -n "radix-ui\|@radix-ui" src/ui/label.tsx` is clean.

## Left alone

- No consumer call sites passed `asChild` to `Label`, so no consumer sweep was needed.

## Behavior changes

None.

## Verify by hand

- Click a `<Label htmlFor="...">` and confirm focus moves to the associated control.
- Double-click label text and confirm it does not get selected (`select-none`).
- Confirm nested-control labels (checkbox list items) still toggle the control when the label text is clicked.
