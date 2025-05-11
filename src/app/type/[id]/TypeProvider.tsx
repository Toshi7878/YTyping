"use client";
import { useSetPreviewVideo } from "@/lib/global-atoms/globalAtoms";
import { RouterOutPuts } from "@/server/api/trpc";
import { Provider as JotaiProvider } from "jotai";
import { RESET, useHydrateAtoms } from "jotai/utils";
import { useEffect } from "react";
import { mapInfoAtom, userTypingOptionsAtom } from "../atoms/stateAtoms";
import { getTypeAtomStore } from "../atoms/store";
interface TypeProviderProps {
  mapInfo: NonNullable<RouterOutPuts["map"]["getMapInfo"]>;
  userTypingOptions: RouterOutPuts["userTypingOption"]["getUserTypingOptions"];
  children: React.ReactNode;
}
const TypeProvider = ({ mapInfo, userTypingOptions, children }: TypeProviderProps) => {
  const typeAtomStore = getTypeAtomStore();
  const setPreviewVideoState = useSetPreviewVideo();

  useHydrateAtoms(
    [[mapInfoAtom, mapInfo], ...(userTypingOptions ? [[userTypingOptionsAtom, userTypingOptions] as const] : [])],
    { dangerouslyForceHydrate: true, store: typeAtomStore }
  );

  useEffect(() => {
    setPreviewVideoState(RESET);

    window.scrollTo({ top: 0, left: 0 });

    const htmlElement = document.documentElement;
    htmlElement.style.overflow = "hidden";

    return () => {
      htmlElement.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <JotaiProvider store={typeAtomStore}>{children}</JotaiProvider>;
};

export default TypeProvider;
