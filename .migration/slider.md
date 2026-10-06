# slider

2026-10-06, transformation engine (legacy `new-york` style). Structural change (new `Control` part), one consumer-prop rename.

## Changed

- `src/ui/slider.tsx`, `src/ui/dual-range-slider.tsx`: `radix-ui` -> `@base-ui/react/slider`. Base UI's anatomy gains a required `Control` part: `Root > Control > Track > (Indicator, Thumb*)` (Radix was `Root > Track > (Range, Thumb*)` with Root itself handling pointer interaction). `Range` -> `Indicator` (renamed, same role). Per the layout-class convention, the Root-level layout classes (`relative flex w-full cursor-grab touch-none select-none items-center`, orientation sizing) moved down to the new `Control` part; `Root` keeps only `data-disabled:opacity-50` plus the caller's `className`.
- Added `thumbAlignment="edge"` on both `Root`s: Base UI defaults to `'center'` (thumb center aligns with the control edge at min/max), but Radix always behaved like `'edge'` via CSS — `edge` keeps the thumb visually inside the track bounds as before.
- Added `index={index}` on every `Thumb` (now required for correct SSR of multi-thumb/range sliders; both wrappers already loop with an index for the React `key`).
- `disabled:pointer-events-none disabled:opacity-50` on `Thumb` -> `data-disabled:*`. Base UI's Thumb renders a `<div>` (nested `<input type="range">` inside it, not on the div itself), so the `disabled:` pseudo-class was never live — true both before and after, but corrected to the form that actually works going forward.
- Leftover scan: `grep -n "radix-ui\|@radix-ui" src/ui/slider.tsx src/ui/dual-range-slider.tsx` is clean.

### Generics

`SliderPrimitive.Root` is generic over `Value extends number | readonly number[]`. Both wrappers always operate in array/range mode (verified every consumer: `volume-range.tsx`, `time-range.tsx`, `tag-filter.tsx`, `difficulty-filter.tsx`, `filter-popover.tsx` all pass `value`/`defaultValue` as arrays, never a bare number), so `SliderProps`/`DualRangeSliderProps` use `SliderPrimitive.Root.Props<number[]>` explicitly rather than leaving the generic unconstrained (which would have erased to a broad default and caused the same `unknown`-collapse problem seen in the radio-group migration).

### Consumer sweep

- `src/app/(home)/_feature/controls/tag-filter.tsx`: `onValueCommit` -> `onValueCommitted` (Base UI renamed the prop; this is the only consumer that used it).
- `src/ui/dual-range-slider.tsx`'s own `ref` type: was `React.Ref<React.ComponentRef<typeof SliderPrimitive.Root>>`, which doesn't resolve cleanly against a generic function component; narrowed to the concretely-known `React.Ref<HTMLDivElement>` (Base UI's `SliderRoot` ref is always `HTMLDivElement` per its own type, independent of `Value`).

## Left alone

- No consumer uses `inverted` (dropped with no direct Base UI equivalent) or relies on `Slider`'s `onValueChange` event-details argument.

## Behavior changes

None expected. `thumbAlignment="edge"` and the `index` prop are there specifically to *preserve* prior visual/SSR behavior, not change it.

## Verify by hand

- Drag each slider (volume, time-range, tag-filter language ratio, difficulty dual-range, timeline filter dual-range) with mouse and keyboard; confirm thumbs stay within the track bounds at min/max and the fill indicator tracks correctly.
- For the dual-range sliders, confirm both thumbs render correctly on first server-rendered paint (no flash/jump) given the new `index` prop.
