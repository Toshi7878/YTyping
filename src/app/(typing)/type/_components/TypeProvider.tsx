"use client";
import { useSetPreviewVideo } from "@/lib/globalAtoms";
import { RouterOutPuts } from "@/server/api/trpc";
import { Provider as JotaiProvider } from "jotai";
import { RESET, useHydrateAtoms } from "jotai/utils";
import { useEffect } from "react";
import { usePathChangeAtomReset } from "../_lib/atoms/reset";
import { mapInfoAtom, userTypingOptionsAtom } from "../_lib/atoms/stateAtoms";
import { getTypeAtomStore } from "../_lib/atoms/store";
import { useDisableKey } from "../_lib/hooks/disableKey";
import { useSendUserStats } from "../_lib/hooks/playing-hooks/sendUserStats";

interface TypeProviderProps {
  mapInfo: NonNullable<RouterOutPuts["map"]["getMapInfo"]>;
  userTypingOptions: RouterOutPuts["userTypingOption"]["getUserTypingOptions"];
  mapId: string;
  children: React.ReactNode;
}

const TypeProvider = ({ mapInfo, userTypingOptions, mapId, children }: TypeProviderProps) => {
  const typeAtomStore = getTypeAtomStore();
  const setPreviewVideoState = useSetPreviewVideo();
  const disableKeyHandle = useDisableKey();
  const { sendTypingStats } = useSendUserStats();
  const pathChangeAtomReset = usePathChangeAtomReset();

  useHydrateAtoms(
    [[mapInfoAtom, mapInfo], ...(userTypingOptions ? [[userTypingOptionsAtom, userTypingOptions] as const] : [])],
    { dangerouslyForceHydrate: true, store: typeAtomStore },
  );

  useEffect(() => {
    setPreviewVideoState(RESET);
  }, [setPreviewVideoState]);

  useEffect(() => {
    window.addEventListener("keydown", disableKeyHandle);

    return () => {
      window.removeEventListener("keydown", disableKeyHandle);
      pathChangeAtomReset();
      sendTypingStats();
    };
  }, [mapId, disableKeyHandle, pathChangeAtomReset, sendTypingStats]);

  return <JotaiProvider store={typeAtomStore}>{children}</JotaiProvider>;
};

export default TypeProvider;
