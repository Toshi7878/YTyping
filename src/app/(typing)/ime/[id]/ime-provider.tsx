"use client";
import { Provider as JotaiProvider } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import type { ReactNode } from "react";
import { useEffect } from "react";
import type { RouterOutPuts } from "@/server/api/trpc";
import { imeTypeOptionsAtom } from "../_lib/atoms/state-atoms";
import { getImeTypeAtomStore } from "../_lib/atoms/store";

interface ImeTypeProviderProps {
  children: ReactNode;
  userImeTypingOptions: RouterOutPuts["userOption"]["getUserImeTypingOptions"];
}

export const ImeTypeProvider = ({ children, userImeTypingOptions }: ImeTypeProviderProps) => {
  const imeTypeAtomStore = getImeTypeAtomStore();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });

    const htmlElement = document.documentElement;
    htmlElement.style.overflow = "hidden";

    return () => {
      htmlElement.style.overflow = "";
    };
  }, []);

  useHydrateAtoms([[imeTypeOptionsAtom, userImeTypingOptions ?? imeTypeAtomStore.get(imeTypeOptionsAtom)]], {
    store: imeTypeAtomStore,
  });

  return <JotaiProvider store={imeTypeAtomStore}>{children}</JotaiProvider>;
};
