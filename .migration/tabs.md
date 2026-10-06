# tabs

2026-10-06, transformation engine (legacy `new-york` style). Clean migration, one inverted-polarity data attribute to watch.

## Changed

- `src/ui/tabs.tsx`: `radix-ui` -> `@base-ui/react/tabs`. `Trigger` -> `Tab`, `Content` -> `Panel`. `data-[state=active]:` -> `data-active:` throughout `tabsTriggerVariants`. The inactive-hover selector `hover:data-[state=inactive]:bg-accent/40` has no direct presence-attribute equivalent (there's no `data-inactive`), so it became `not-data-active:hover:bg-accent/40` (Tailwind v4's `not-*` variant negating `data-active`). `Tab` still renders a real `<button>`, so `disabled:*` was left untouched (not dead code here, unlike checkbox/switch/radio).
- `forceMount` -> `keepMounted` on `TabsContent`, plus the inverted-polarity fix: Radix marked the *active* state (`data-state="active"|"inactive"`); Base UI's `Panel` instead marks the *hidden* state via a presence attribute (`data-hidden`). The old `props.forceMount && "data-[state=inactive]:hidden"` became `props.keepMounted && "data-hidden:hidden"`.
- Leftover scan: `grep -n "radix-ui\|@radix-ui" src/ui/tabs.tsx` is clean.

### Consumer sweep

`forceMount` -> `keepMounted` at all 3 real call sites (grepped `forceMount` project-wide; the `Sheet`/`SheetContent` hits are an unrelated Dialog-family `forceMount`, left for that migration):
- `src/app/(typing)/type/_feature/tabs/tabs.tsx` (`ステータス` tab)
- `src/app/edit/_feature/tabs/tabs.tsx` (`情報&保存`, `エディター` tabs)

No consumer uses `activationMode` (grepped project-wide), so the manual-vs-automatic activation default flip (Radix defaults to automatic; Base UI 1.6+ defaults to manual, opt back in with `List activateOnFocus`) doesn't need patching — but see Behavior changes below.

## Left alone

- Nothing related was intentionally skipped.

## Behavior changes

- **Flagged, not patched**: Base UI's `Tabs.List` defaults to **manual** tab activation (arrow-key focus doesn't switch the active panel until Enter/Space), where Radix defaulted to **automatic** (focus itself switches the panel). No consumer opts into `activateOnFocus` to restore the old default, per the migration skill's explicit instruction not to auto-add it. If the automatic-on-arrow-key feel is wanted back, add `activateOnFocus` to `TabsList` (would need to become a passthrough prop, or always-on if that's the desired product behavior).

## Verify by hand

- Click between tabs on the typing-card status/ranking tabs and the edit-page tabs; confirm the active tab's styling and panel content switch correctly.
- Use arrow keys to move focus between tabs and confirm the behavior change above (panel does NOT switch until Enter/Space) is acceptable, or follow up if automatic activation is actually wanted.
- For the `keepMounted` tabs (ステータス, 情報&保存, エディター), confirm their panels stay mounted (check DOM) and are hidden via `display: none` while inactive, not full remove/unmount.
