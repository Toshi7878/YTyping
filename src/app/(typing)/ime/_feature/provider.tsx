"use client";
import { createStore, Provider } from "jotai";
import type { ReactNode } from "react";
import { AtomsHydrator } from "@/components/shared/jotai";
import type { RouterOutputs } from "@/server/api/trpc";
import { mapIdAtom } from "../_lib/atoms/hydrate";
import { imeTypeOptionsAtom } from "../_lib/atoms/state";

export const store = createStore();

interface JotaiProviderProps {
  children: ReactNode;
  userImeTypingOptions: RouterOutputs["user"]["imeTypingOption"]["getForSession"];
  mapId: number;
}

export const JotaiProvider = ({ children, userImeTypingOptions, mapId }: JotaiProviderProps) => {
  return (
    <Provider store={store}>
      <AtomsHydrator
        atomValues={[
          ...(userImeTypingOptions ? [[imeTypeOptionsAtom, userImeTypingOptions] as const] : []),
          [mapIdAtom, mapId],
        ]}
        dangerouslyForceHydrate
      >
        {children}
      </AtomsHydrator>
    </Provider>
  );
};
