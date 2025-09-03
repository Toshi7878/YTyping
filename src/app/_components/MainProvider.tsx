"use client";
import { AlertDialogProvider } from "@/components/ui/alert-dialog/alert-dialog-provider";
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
    <AlertDialogProvider>
      <LoadingOverlayProvider message={message} isLoading={isLoading} hideSpinner={hideSpinner} asChild>
        {children}
      </LoadingOverlayProvider>
    </AlertDialogProvider>
  );
};

export default MainProvider;
