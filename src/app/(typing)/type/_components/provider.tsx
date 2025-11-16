"use client";
import { Provider } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { type ReactNode, useEffect } from "react";
import type { RouterOutPuts } from "@/server/api/trpc";
import { mapIdAtom, setMapId, typingOptionsAtom } from "../_lib/atoms/hydrate";
import { resetAllStateOnCleanup } from "../_lib/atoms/reset";
import { getTypeAtomStore } from "../_lib/atoms/store";
import { mutateTypingStats } from "../_lib/mutate-stats";

interface JotaiProviderProps {
  userTypingOptions: RouterOutPuts["userOption"]["getUserTypingOptions"];
  mapId: string;
  children: ReactNode;
}

export const JotaiProvider = ({ userTypingOptions, mapId, children }: JotaiProviderProps) => {
  const store = getTypeAtomStore();

  useHydrateAtoms(
    [
      [mapIdAtom, mapId ? Number(mapId) : null],
      ...(userTypingOptions ? [[typingOptionsAtom, userTypingOptions] as const] : []),
    ],
    { store },
  );

  useEffect(() => {
    setMapId(mapId ? Number(mapId) : null);
    return () => {
      mutateTypingStats();
      resetAllStateOnCleanup();
    };
  }, [mapId]);

  return <Provider store={store}>{children}</Provider>;
};
