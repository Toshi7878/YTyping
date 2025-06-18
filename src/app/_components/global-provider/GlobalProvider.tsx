"use client";
import { LoadingProvider } from "@/lib/useLoadingOverlay";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

interface ClientProviderProps {
  children: React.ReactNode;
}

const ClientProvider = ({ children }: ClientProviderProps) => {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.getSelection) return;

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      selection.removeAllRanges();
    }
  }, [pathname]);

  return <LoadingProvider>{children}</LoadingProvider>;
};

export default ClientProvider;
