"use client";
import { getGlobalAtomStore, userOptionsAtom } from "@/lib/global-atoms/globalAtoms";
import { RouterOutPuts } from "@/server/api/trpc";
import { Provider as JotaiProvider } from "jotai";
import { usePathname } from "next/navigation";
import nProgress from "nprogress";
import { useEffect } from "react";
import { GlobalRefProvider } from "./GlobalRefProvider";

interface GlobalProviderProps {
  children: React.ReactNode;
  userOptions: RouterOutPuts["userOption"]["getUserOptions"];
}

const GlobalProvider = ({ children, userOptions }: GlobalProviderProps) => {
  const globalAtomStore = getGlobalAtomStore();
  const pathname = usePathname();

  if (userOptions) {
    globalAtomStore.set(userOptionsAtom, userOptions);
  }

  useEffect(() => {
    window.getSelection()!.removeAllRanges();
    nProgress.done();
  }, [pathname]);

  return (
    <>
      <GlobalRefProvider>
        <JotaiProvider store={globalAtomStore}>{children}</JotaiProvider>
      </GlobalRefProvider>
    </>
  );
};

export default GlobalProvider;
