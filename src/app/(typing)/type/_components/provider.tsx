"use client";
import { Provider } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { type ReactNode, useEffect } from "react";
import type { RouterOutPuts } from "@/server/api/trpc";
import { mapIdAtom, setMapId, typingOptionsAtom } from "../_lib/atoms/hydrate";
import { resetAllStateOnCleanup } from "../_lib/atoms/reset";
import { getTypeAtomStore } from "../_lib/atoms/store";

interface JotaiProviderProps {
  userTypingOptions: RouterOutPuts["userOption"]["getUserTypingOptions"];
  mapId: number;
  children: ReactNode;
}

export const JotaiProvider = ({ userTypingOptions, mapId, children }: JotaiProviderProps) => {
  const store = getTypeAtomStore();

  useHydrateAtoms(
    [[mapIdAtom, mapId], ...(userTypingOptions ? [[typingOptionsAtom, userTypingOptions] as const] : [])],
    { store },
  );

  useEffect(() => {
    resetAllStateOnCleanup();
    setMapId(mapId);
  }, [mapId]);

  return <Provider store={store}>{children}</Provider>;
};
