# scroll-area

2026-10-06, transformation engine (legacy `new-york` style). Clean, direct rename; one dropped prop at its single call site.

## Changed

- `src/ui/scroll-area.tsx`: `radix-ui` -> `@base-ui/react/scroll-area`. `ScrollAreaScrollbar` -> `Scrollbar`, `ScrollAreaThumb` -> `Thumb` (rename only, same role/anatomy on both sides).
- Leftover scan: `grep -n "radix-ui\|@radix-ui" src/ui/scroll-area.tsx` is clean.

### Consumer sweep

- `src/app/(typing)/type/_feature/typing-card/playing/line-practice/line-practice-sheet.tsx`: `<ScrollArea type="always">` -> `<ScrollArea>` (the only `type` usage project-wide). Base UI dropped `type` entirely; visibility is meant to be CSS-driven via `[data-hovering]`/`[data-scrolling]`/`[data-has-overflow-*]`, but this project's `ScrollBar` styling never conditioned opacity on those states in the first place (no hover-reveal behavior exists either before or after), so dropping the prop changes nothing when content actually overflows. The one real difference: Radix's `type="always"` also kept the scrollbar mounted even when content *doesn't* overflow; Base UI's default only mounts the scrollbar when scrollable, and this project's shared `ScrollArea` wrapper has no pass-through for `keepMounted` on its internal `ScrollBar`. Flagging as a narrow, likely-invisible-in-practice behavior delta rather than wiring up a new prop nobody else needs.

## Left alone

- Nothing else; this was the simplest migration so far (direct 1:1 part renames, no data-attribute or CSS-var changes, no asChild usage anywhere in the file).

## Behavior changes

- Flagged (not patched): on the one `type="always"` call site, if `PracticeLineTable` content is ever short enough not to overflow, the scrollbar will no longer stay mounted-but-inert the way it did under Radix. In practice this table is expected to overflow during normal use, so this is unlikely to be visible; revisit only if it turns out to matter.

## Verify by hand

- Scroll any `ScrollArea` instance (practice line table, etc.) and confirm the thumb tracks correctly and the scrollbar renders in the right position/orientation.
