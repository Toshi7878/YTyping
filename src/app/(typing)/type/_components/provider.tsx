"use client";
import { Provider } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { type ReactNode, useEffect } from "react";
import { resetPreviewVideo } from "@/lib/atoms/global-atoms";
import type { RouterOutPuts } from "@/server/api/trpc";
import { mapIdAtom, setMapId, typingOptionsAtom } from "../_lib/atoms/hydrate";
import { resetAllStateOnCleanup } from "../_lib/atoms/reset";
import { getTypeAtomStore } from "../_lib/atoms/store";
import { mutateTypingStats } from "../_lib/mutate-stats";
import { useLoadSoundEffects } from "../_lib/playing/sound-effect";

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

interface ClientProviderProps {
  children: ReactNode;
}

export const ClientProvider = ({ children }: ClientProviderProps) => {
  useLoadSoundEffects();

  useEffect(() => {
    resetPreviewVideo();
    const DISABLE_KEYS = ["Home", "End", "PageUp", "PageDown", "CapsLock", "Backquote", "F3", "F6", "Space"];

    const disableKeyHandle = (event: KeyboardEvent) => {
      if (DISABLE_KEYS.includes(event.code)) {
        event.preventDefault();
      }
    };
    window.addEventListener("keydown", disableKeyHandle);

    return () => {
      window.removeEventListener("keydown", disableKeyHandle);
    };
  }, []);

  return <>{children}</>;
};
