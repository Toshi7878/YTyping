"use client";
import { getGlobalAtomStore, userOptionsAtom } from "@/lib/global-atoms/globalAtoms";
import { RouterOutPuts } from "@/server/api/trpc";
import { Provider as JotaiProvider } from "jotai";
import { GlobalRefProvider } from "./GlobalRefProvider";

interface GlobalProviderProps {
  children: React.ReactNode;
  userOptions: RouterOutPuts["userOption"]["getUserOptions"];
}

const GlobalProvider = ({ children, userOptions }: GlobalProviderProps) => {
  const globalAtomStore = getGlobalAtomStore();

  if (userOptions) {
    globalAtomStore.set(userOptionsAtom, userOptions);
  }

  return (
    <>
      <GlobalRefProvider>
        <JotaiProvider store={globalAtomStore}>{children}</JotaiProvider>
      </GlobalRefProvider>
    </>
  );
};

export default GlobalProvider;
