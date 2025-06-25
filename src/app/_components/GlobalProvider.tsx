"use client";
import { getGlobalStore } from "@/lib/globalAtoms";
import { LoadingProvider } from "@/lib/useLoadingOverlay";
import { Provider as JotaiProvider } from "jotai";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

interface GlobalProviderProps {
  children: React.ReactNode;
}

const GlobalProvider = ({ children }: GlobalProviderProps) => {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.getSelection) return;

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      selection.removeAllRanges();
    }
  }, [pathname]);

  return (
    <LoadingProvider>
      <JotaiProvider store={getGlobalStore()}>{children}</JotaiProvider>
    </LoadingProvider>
  );
};

export default GlobalProvider;
