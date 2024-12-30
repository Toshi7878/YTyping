"use client";
import { getGlobalAtomStore, previewVideoIdAtom } from "@/lib/global-atoms/globalAtoms";
import { RouterOutPuts } from "@/server/api/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createStore, Provider as JotaiProvider } from "jotai";
import { useEffect } from "react";
import { hasLocalLikeAtom, mapUpdatedAtAtom, userOptionsAtom } from "../type-atoms/gameRenderAtoms";
import { RefsProvider } from "../type-contexts/refsProvider";

const typeAtomStore = createStore();
export const getTypeAtomStore = () => typeAtomStore;
const queryClient = new QueryClient();

interface TypeProviderProps {
  mapInfo: RouterOutPuts["map"]["getMapInfo"];
  userTypingOptions: RouterOutPuts["userTypingOption"]["getUserTypingOptions"];
  children: React.ReactNode;
}
const TypeProvider = ({ mapInfo, userTypingOptions, children }: TypeProviderProps) => {
  const globalAtomStore = getGlobalAtomStore();
  globalAtomStore.set(previewVideoIdAtom, null);
  typeAtomStore.set(hasLocalLikeAtom, !!mapInfo?.mapLike[0]?.isLiked);
  typeAtomStore.set(mapUpdatedAtAtom, mapInfo!.updatedAt);
  useEffect(() => {
    window.getSelection()!.removeAllRanges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (userTypingOptions) {
    typeAtomStore.set(userOptionsAtom, userTypingOptions);
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RefsProvider>
        <JotaiProvider store={typeAtomStore}>{children}</JotaiProvider>
      </RefsProvider>
    </QueryClientProvider>
  );
};

export default TypeProvider;
