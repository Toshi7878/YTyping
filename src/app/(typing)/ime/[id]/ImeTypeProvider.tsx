"use client";
import { RouterOutPuts } from "@/server/api/trpc";
import { Provider as JotaiProvider } from "jotai";
import { RESET, useHydrateAtoms } from "jotai/utils";
import { useEffect } from "react";
import { imeTypeOptionsAtom } from "../_lib/atoms/stateAtoms";
import { getImeTypeAtomStore } from "../_lib/atoms/store";

interface ImeTypeProviderProps {
  children: React.ReactNode;
  userImeTypingOptions: RouterOutPuts["userTypingOption"]["getUserImeTypingOptions"];
}
const ImeTypeProvider = ({ children, userImeTypingOptions }: ImeTypeProviderProps) => {
  const imeTypeAtomStore = getImeTypeAtomStore();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });

    const htmlElement = document.documentElement;
    htmlElement.style.overflow = "hidden";

    return () => {
      htmlElement.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useHydrateAtoms([[imeTypeOptionsAtom, userImeTypingOptions || RESET]], { store: imeTypeAtomStore });

  return <JotaiProvider store={imeTypeAtomStore}>{children}</JotaiProvider>;
};

export default ImeTypeProvider;
