"use client";

import React, { createContext, useCallback, useContext, useState } from "react";

interface LoadingState {
  count: number;
  message?: string;
}

interface LoadingContextType {
  isLoading: boolean;
  message?: string;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: React.ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [loadingState, setLoadingState] = useState<LoadingState>({ count: 0 });

  const showLoading = useCallback((message?: string) => {
    setLoadingState((prev) => ({
      count: prev.count + 1,
      message: message || prev.message,
    }));
  }, []);

  const hideLoading = useCallback(() => {
    setLoadingState((prev) => ({
      count: Math.max(0, prev.count - 1),
      message: prev.count <= 1 ? undefined : prev.message,
    }));
  }, []);

  const value = {
    isLoading: loadingState.count > 0,
    message: loadingState.message,
    showLoading,
    hideLoading,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <LoadingOverlay isLoading={loadingState.count > 0} message={loadingState.message} />
    </LoadingContext.Provider>
  );
};

export const useLoadingOverlay = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoadingOverlay must be used within a LoadingProvider");
  }
  return context;
};

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading, message }) => {
  if (!isLoading) return null;

  return (
    <div
      className="bg-background/60 fixed inset-0 top-[40px] z-[25] flex items-center justify-center backdrop-blur-sm transition-opacity duration-200"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="border-border bg-card relative flex flex-col items-center gap-4 rounded-xl border p-8 shadow-2xl">
        <div className="border-muted border-t-primary h-12 w-12 animate-spin rounded-full border-4" />
        {message && <p className="text-foreground text-sm font-medium">{message}</p>}
      </div>
    </div>
  );
};
