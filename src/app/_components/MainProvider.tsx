"use client";
import { LoadingOverlayProvider } from "@/components/ui/loading-overlay";
import { useGlobalLoadingState } from "@/lib/globalAtoms";
import { useClearSelectionOnNavigate } from "@/utils/use-clear-selection-on-navigate";

interface MainProviderProps {
  children: React.ReactNode;
}

const MainProvider = ({ children }: MainProviderProps) => {
  useClearSelectionOnNavigate();
  const { message, isLoading, hideSpinner } = useGlobalLoadingState();

  return (
    <LoadingOverlayProvider message={message} isLoading={isLoading} hideSpinner={hideSpinner} asChild>
      {children}
    </LoadingOverlayProvider>
  );
};

export default MainProvider;
