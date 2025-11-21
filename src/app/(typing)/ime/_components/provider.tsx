"use client";
import { Provider } from "jotai";
import type { ReactNode } from "react";
import { AtomsHydrator } from "@/components/shared/jotai";
import type { RouterOutPuts } from "@/server/api/trpc";
import { mapIdAtom } from "../_lib/atoms/hydrate";
import { imeTypeOptionsAtom } from "../_lib/atoms/state";
import { getImeAtomStore } from "../_lib/atoms/store";

interface JotaiProviderProps {
  children: ReactNode;
  userImeTypingOptions: RouterOutPuts["userOption"]["getUserImeTypingOptions"];
  mapId: number;
}

export const JotaiProvider = ({ children, userImeTypingOptions, mapId }: JotaiProviderProps) => {
  const store = getImeAtomStore();

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
