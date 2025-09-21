"use client";
import { LoadingOverlayProvider } from "@/components/ui/loading-overlay";
import { useGlobalLoadingState, userAgentAtom } from "@/lib/globalAtoms";
import { useClearSelectionOnNavigate } from "@/utils/use-clear-selection-on-navigate";
import { useHydrateAtoms } from "jotai/utils";
import { UAParser } from "ua-parser-js";

interface MainProviderProps {
  children: React.ReactNode;
  userAgent: string;
}

const MainProvider = ({ children, userAgent }: MainProviderProps) => {
  useClearSelectionOnNavigate();
  const { message, isLoading, hideSpinner } = useGlobalLoadingState();

  useHydrateAtoms([[userAgentAtom, new UAParser(userAgent)]]);

  return (
    <LoadingOverlayProvider message={message} isLoading={isLoading} hideSpinner={hideSpinner} asChild>
      {children}
    </LoadingOverlayProvider>
  );
};

export default MainProvider;
