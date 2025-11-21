"use client";
import { Provider } from "jotai";
import { type ReactNode, useEffect } from "react";
import { AtomsHydrator } from "@/components/shared/jotai";
import type { RouterOutPuts } from "@/server/api/trpc";
import { mapIdAtom, typingOptionsAtom } from "../_lib/atoms/hydrate";
import { resetAllStateOnCleanup } from "../_lib/atoms/reset";
import { getTypeAtomStore } from "../_lib/atoms/store";

interface JotaiProviderProps {
  userTypingOptions: RouterOutPuts["userOption"]["getUserTypingOptions"];
  mapId: number;
  children: ReactNode;
}

export const JotaiProvider = ({ userTypingOptions, mapId, children }: JotaiProviderProps) => {
  const store = getTypeAtomStore();

  useEffect(() => {
    resetAllStateOnCleanup();
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
