"use client";
import { atom, type ExtractAtomValue, useAtomValue } from "jotai";
import { atomWithReset, RESET } from "jotai/vanilla/utils";
import { focusAtom } from "jotai-optics";
import { uncontrolled } from "jotai-uncontrolled";
import { cn } from "@/lib/utils";
import type { Updater } from "@/utils/types";
import { getBuiltMap } from "../../atoms/built-map";
import { store } from "../../atoms/store";
import { getRankingData } from "../ranking/get-ranking-result";
import type { LabelType } from "./status-card";

const typingStatusAtom = atomWithReset({
  score: 0,
  type: 0,
  kpm: 0,
  rank: 0,
  point: 0,
  miss: 0,
  lost: 0,
  line: 0,
  timeBonus: 0,
});
export type TypingStatus = ExtractAtomValue<typeof typingStatusAtom>;

const typingStatusViewAtoms = {
  score: focusAtom(typingStatusAtom, (optic) => optic.prop("score")),
  point: focusAtom(typingStatusAtom, (optic) => optic.prop("point")),
  timeBonus: atom((get) => {
    const timeBonus = get(focusAtom(typingStatusAtom, (optic) => optic.prop("timeBonus")));
    return timeBonus === 0 ? "" : `+${String(timeBonus)}`;
  }),
  type: focusAtom(typingStatusAtom, (optic) => optic.prop("type")),
  kpm: focusAtom(typingStatusAtom, (optic) => optic.prop("kpm")),
  miss: focusAtom(typingStatusAtom, (optic) => optic.prop("miss")),
  lost: focusAtom(typingStatusAtom, (optic) => optic.prop("lost")),
  rank: focusAtom(typingStatusAtom, (optic) => optic.prop("rank")),
  line: focusAtom(typingStatusAtom, (optic) => optic.prop("line")),
};
export const useTypingStatusState = () => useAtomValue(typingStatusAtom);
export const getTypingStatus = () => store.get(typingStatusAtom);

export const setTypingStatus = (update: Updater<TypingStatus>) => store.set(typingStatusAtom, update);

export const resetTypingStatus = () => {
  store.set(typingStatusAtom, RESET);
  const map = getBuiltMap();
  setTypingStatus((prev) => ({ ...prev, line: map?.typingLineIndexes.length ?? 0 }));

  const ranking = getRankingData();
  setTypingStatus((prev) => ({ ...prev, rank: ranking.length + 1 }));
};

interface StatusCellProps {
  label: LabelType;
}

export const StatusCell = ({ label }: StatusCellProps) => {
  const atom = typingStatusViewAtoms[label];

  return (
    <div id={label} className={cn("w-full", label === "score" || label === "point" ? "w-64 md:w-36" : "w-28 md:w-20")}>
      <div
        className={cn(
          "status-label mb-0.5 text-muted-foreground capitalize md:text-[60%]",
          label === "kpm" && "tracking-[0.2em]",
        )}
      >
        {label}
      </div>
      <div className={cn("value text-6xl md:text-[2.2rem]")}>
        {label === "point" ? (
          <>
            <uncontrolled.span atomStore={store}>{typingStatusViewAtoms.point}</uncontrolled.span>
            <uncontrolled.small atomStore={store}>{typingStatusViewAtoms.timeBonus}</uncontrolled.small>
          </>
        ) : (
          <uncontrolled.span atomStore={store}>{atom}</uncontrolled.span>
        )}
      </div>
      <div id="status_underline" className="h-0.5 w-full shrink-0 bg-card-foreground" aria-hidden={true} />
    </div>
  );
};
