"use client";
import { Provider } from "jotai";
import type { ReactNode } from "react";
import { AtomsHydrator } from "@/components/shared/jotai";
import type { RouterOutputs } from "@/server/api/trpc";
import { mapIdAtom } from "./atoms/hydrate";
import { getTypingGameAtomStore } from "./atoms/store";
import { typingOptionsAtom } from "./tabs/setting/popover";

interface JotaiProviderProps {
  userTypingOptions: RouterOutputs["user"]["typingOption"]["getForSession"];
  mapId: number;
  children: ReactNode;
}

export const JotaiProvider = ({ userTypingOptions, mapId, children }: JotaiProviderProps) => {
  const store = getTypingGameAtomStore();

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
