"use client";
import { Provider as JotaiProvider } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { resetPreviewVideo } from "@/lib/atoms/global-atoms";
import type { RouterOutPuts } from "@/server/api/trpc";
import { mapIdAtom } from "../_lib/atoms/ref";
import { resetAllStateOnCleanup } from "../_lib/atoms/reset";
import { userTypingOptionsAtom } from "../_lib/atoms/state";
import { getTypeAtomStore } from "../_lib/atoms/store";
import { mutateTypingStats } from "../_lib/playing/mutate-stats";
import { useLoadSoundEffects } from "../_lib/playing/sound-effect";

interface ClientProviderProps {
  userTypingOptions: RouterOutPuts["userOption"]["getUserTypingOptions"];
  mapId: string;
  children: ReactNode;
}

export const ClientProvider = ({ userTypingOptions, mapId, children }: ClientProviderProps) => {
  const store = getTypeAtomStore();

  useHydrateAtoms(
    [[mapIdAtom, Number(mapId)], ...(userTypingOptions ? [[userTypingOptionsAtom, userTypingOptions] as const] : [])],
    {
      dangerouslyForceHydrate: true,
      store,
    },
  );

  useLoadSoundEffects();
  useEffect(() => {
    resetPreviewVideo();
  }, []);

  useEffect(() => {
    const DISABLE_KEYS = ["Home", "End", "PageUp", "PageDown", "CapsLock", "Backquote", "F3", "F6", "Space"];

    const disableKeyHandle = (event: KeyboardEvent) => {
      if (DISABLE_KEYS.includes(event.code)) {
        event.preventDefault();
      }
    };

    window.addEventListener("keydown", disableKeyHandle);

    return () => {
      window.removeEventListener("keydown", disableKeyHandle);
      mutateTypingStats();
      resetAllStateOnCleanup();
    };
  }, [mapId]);

  return <JotaiProvider store={store}>{children}</JotaiProvider>;
};
