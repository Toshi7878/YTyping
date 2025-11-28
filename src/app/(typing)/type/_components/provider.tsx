"use client";
import { Provider } from "jotai";
import type { ReactNode } from "react";
import { AtomsHydrator } from "@/components/shared/jotai";
import type { RouterOutputs } from "@/server/api/trpc";
import { mapIdAtom, typingOptionsAtom } from "../_lib/atoms/hydrate";
import { getTypeAtomStore } from "../_lib/atoms/store";

interface JotaiProviderProps {
  userTypingOptions: RouterOutputs["userOption"]["getUserTypingOptions"];
  mapId: number;
  children: ReactNode;
}

export const JotaiProvider = ({ userTypingOptions, mapId, children }: JotaiProviderProps) => {
  const store = getTypeAtomStore();

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
