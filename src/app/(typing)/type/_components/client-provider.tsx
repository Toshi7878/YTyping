"use client";
import { Provider as JotaiProvider } from "jotai";
import { RESET, useHydrateAtoms } from "jotai/utils";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useSetPreviewVideo } from "@/lib/atoms/global-atoms";
import type { RouterOutPuts } from "@/server/api/trpc";
import { resetAllStateOnCleanup } from "../_lib/atoms/reset";
import { userTypingOptionsAtom } from "../_lib/atoms/state";
import { getTypeAtomStore } from "../_lib/atoms/store";
import { useLoadSoundEffects } from "../_lib/playing/sound-effect";
import { useSendUserStats } from "../_lib/playing/use-send-user-stats";

interface ClientProviderProps {
  userTypingOptions: RouterOutPuts["userOption"]["getUserTypingOptions"];
  mapId: string;
  children: ReactNode;
}

export const ClientProvider = ({ userTypingOptions, mapId, children }: ClientProviderProps) => {
  const store = getTypeAtomStore();
  const setPreviewVideoState = useSetPreviewVideo();
  const { sendTypingStats } = useSendUserStats();

  useHydrateAtoms([...(userTypingOptions ? [[userTypingOptionsAtom, userTypingOptions] as const] : [])], {
    dangerouslyForceHydrate: true,
    store,
  });

  useLoadSoundEffects();
  useEffect(() => {
    setPreviewVideoState(RESET);
  }, [setPreviewVideoState]);

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
      resetAllStateOnCleanup();
      sendTypingStats();
    };
  }, [mapId, sendTypingStats]);

  return <JotaiProvider store={store}>{children}</JotaiProvider>;
};
