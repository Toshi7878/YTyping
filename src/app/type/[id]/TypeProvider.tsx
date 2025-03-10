"use client";
import { getGlobalAtomStore, previewVideoIdAtom } from "@/lib/global-atoms/globalAtoms";
import { RouterOutPuts } from "@/server/api/trpc";
import { Provider as JotaiProvider } from "jotai";
import { useEffect } from "react";
import {
  getTypeAtomStore,
  hasLocalLikeAtom,
  mapInfoAtom,
  mapUpdatedAtAtom,
  userTypingOptionsAtom,
} from "../type-atoms/gameRenderAtoms";
import { RefsProvider } from "../type-contexts/refsProvider";

interface TypeProviderProps {
  mapInfo: NonNullable<RouterOutPuts["map"]["getMapInfo"]>;
  userTypingOptions: RouterOutPuts["userTypingOption"]["getUserTypingOptions"];
  children: React.ReactNode;
}
const TypeProvider = ({ mapInfo, userTypingOptions, children }: TypeProviderProps) => {
  const globalAtomStore = getGlobalAtomStore();
  const typeAtomStore = getTypeAtomStore();

  typeAtomStore.set(hasLocalLikeAtom, !!mapInfo.map_likes[0]?.is_liked);
  typeAtomStore.set(mapInfoAtom, mapInfo);

  useEffect(() => {
    globalAtomStore.set(previewVideoIdAtom, null);
    typeAtomStore.set(mapUpdatedAtAtom, mapInfo!.updated_at);
    if (userTypingOptions) {
      typeAtomStore.set(userTypingOptionsAtom, userTypingOptions);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapInfo, userTypingOptions]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });

    const htmlElement = document.documentElement;
    // <html> 要素に overflow: hidden を設定
    htmlElement.style.overflow = "hidden";

    // コンポーネントのアンマウント時に元のスタイルに戻す
    return () => {
      htmlElement.style.overflow = "";
    };
  }, []);
  return (
    <RefsProvider>
      <JotaiProvider store={typeAtomStore}>{children}</JotaiProvider>
    </RefsProvider>
  );
};

export default TypeProvider;
