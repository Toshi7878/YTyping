"use client";
import { getGlobalAtomStore, userOptionsAtom } from "@/lib/global-atoms/globalAtoms";
import { RouterOutPuts } from "@/server/api/trpc";
import { Provider as JotaiProvider } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { usePathname } from "next/navigation";
import nProgress from "nprogress";
import { useEffect } from "react";

interface GlobalProviderProps {
  children: React.ReactNode;
  userOptions: RouterOutPuts["userOption"]["getUserOptions"];
}

const GlobalProvider = ({ children, userOptions }: GlobalProviderProps) => {
  const globalAtomStore = getGlobalAtomStore();
  const pathname = usePathname();
  useHydrateAtoms([[userOptionsAtom, userOptions]], { store: globalAtomStore });

  useEffect(() => {
    window.getSelection()!.removeAllRanges();
    nProgress.done();
  }, [pathname]);

  return <JotaiProvider store={globalAtomStore}>{children}</JotaiProvider>;
};

export default GlobalProvider;
