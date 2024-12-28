"use client";
import { getGlobalAtomStore } from "@/components/atom/globalAtoms";
import { GlobalRefProvider } from "@/components/global-provider/GlobalRefProvider";
import { Provider as JotaiProvider } from "jotai";

const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const globalAtomStore = getGlobalAtomStore();

  return (
    <>
      <GlobalRefProvider>
        <JotaiProvider store={globalAtomStore}>{children}</JotaiProvider>
      </GlobalRefProvider>
    </>
  );
};

export default GlobalProvider;
