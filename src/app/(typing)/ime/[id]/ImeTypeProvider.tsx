"use client";
import { Provider as JotaiProvider } from "jotai";
import { useEffect } from "react";
import { getImeTypeAtomStore } from "../atom/store";

interface ImeTypeProviderProps {
  children: React.ReactNode;
}
const ImeTypeProvider = ({ children }: ImeTypeProviderProps) => {
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

  return <JotaiProvider store={imeTypeAtomStore}>{children}</JotaiProvider>;
};

export default ImeTypeProvider;
