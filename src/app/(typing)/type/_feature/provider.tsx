"use client";
import { Provider } from "jotai";
import { atomWithReset, RESET } from "jotai/utils";
import { type ReactNode, useEffect } from "react";
import { AtomsHydrator } from "@/lib/jotai-hydrator";
import type { RouterOutputs } from "@/server/api/trpc";
import { resetAllTypingFeatureAtoms } from "./atoms/reset";
import { getTypingStats } from "./atoms/stats";
import { store } from "./atoms/store";
import { mutateTypingStats } from "./lib/stats";
import { typingOptionsAtom } from "./tabs/setting/popover";
import { getScene } from "./typing-card/typing-card";

const mapIdAtom = atomWithReset<number | null>(null);
export const getMapId = () => store.get(mapIdAtom);
export const resetMapId = () => store.set(mapIdAtom, RESET);

interface JotaiProviderProps {
  userTypingOptions: RouterOutputs["user"]["typingOption"]["getForSession"];
  mapId: number;
  children: ReactNode;
}

export const JotaiProvider = ({ userTypingOptions, mapId, children }: JotaiProviderProps) => {
  // biome-ignore lint/correctness/useExhaustiveDependencies:  pathname変更時のみ発火させたいため
  useEffect(() => {
    return () => {
      const scene = getScene();
      if (scene === "play" || scene === "practice") {
        const stats = getTypingStats();
        mutateTypingStats(stats);
      }
      resetAllTypingFeatureAtoms();
    };
  }, [mapId]);

  return (
    <Provider store={store}>
      <AtomsHydrator
        atomValues={[
          [mapIdAtom, mapId],
          ...(userTypingOptions ? [[typingOptionsAtom, userTypingOptions] as const] : []),
        ]}
        dangerouslyForceHydrate
      >
        {children}
      </AtomsHydrator>
    </Provider>
  );
};
