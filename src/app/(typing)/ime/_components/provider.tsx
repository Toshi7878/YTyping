"use client";
import { Provider } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { type ReactNode, useEffect } from "react";
import type { RouterOutPuts } from "@/server/api/trpc";
import { mapIdAtom, setMapId } from "../_lib/atoms/hydrate";
import { imeTypeOptionsAtom } from "../_lib/atoms/state";
import { getImeAtomStore } from "../_lib/atoms/store";

interface JotaiProviderProps {
  children: ReactNode;
  userImeTypingOptions: RouterOutPuts["userOption"]["getUserImeTypingOptions"];
  mapId: number;
}

export const JotaiProvider = ({ children, userImeTypingOptions, mapId }: JotaiProviderProps) => {
  const store = getImeAtomStore();
  useHydrateAtoms(
    [...(userImeTypingOptions ? [[imeTypeOptionsAtom, userImeTypingOptions] as const] : []), [mapIdAtom, mapId]],
    { store },
  );

  useEffect(() => {
    setMapId(mapId);
  }, [mapId]);
  return <Provider store={store}>{children}</Provider>;
};
