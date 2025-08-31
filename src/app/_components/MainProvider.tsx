"use client";
import { LoadingProvider } from "@/components/ui/loading-overlay";
import { useClearSelectionOnNavigate } from "@/utils/use-clear-selection-on-navigate";

interface MainProviderProps {
  children: React.ReactNode;
}

const MainProvider = ({ children }: MainProviderProps) => {
  useClearSelectionOnNavigate();

  return <LoadingProvider>{children}</LoadingProvider>;
};

export default MainProvider;
