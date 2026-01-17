"use client";
import { Provider } from "jotai";
import type React from "react";
import { AtomsHydrator } from "@/components/shared/jotai";
import type { RouterOutputs } from "@/server/api/trpc";
import { getHomeAtomStore, listLayoutTypeAtom } from "../_lib/atoms";

interface JotaiProviderProps {
  children: React.ReactNode;
  userOptions: RouterOutputs["user"]["option"]["getForSession"];
}

export const JotaiProvider = ({ children, userOptions }: JotaiProviderProps) => {
  const store = getHomeAtomStore();
  // useEffect(() => {
  //   setListLayoutType(userOptions?.mapListLayout ?? "TWO_COLUMNS");
  // }, [userOptions]);
  return (
    <Provider store={store}>
      <AtomsHydrator
        atomValues={[[listLayoutTypeAtom, userOptions?.mapListLayout ?? "TWO_COLUMNS"]]}
        dangerouslyForceHydrate
      >
        {children}
      </AtomsHydrator>
    </Provider>
  );
};
