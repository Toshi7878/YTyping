"use client";

import React from "react";
import { useLoadingState } from "./globalAtoms";

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { message, isLoading, hideSpinner } = useLoadingState();

  return (
    <>
      {children}
      <LoadingOverlay isLoading={isLoading} message={message} hideSpinner={hideSpinner} />
    </>
  );
};

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: React.ReactNode;
  hideSpinner?: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading, message, hideSpinner }) => {
  if (!isLoading) return null;

  return (
    <div
      className="bg-background/60 fixed inset-0 top-[40px] z-[25] flex items-center justify-center backdrop-blur-sm transition-opacity duration-200"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="border-border bg-card relative flex flex-col items-center gap-4 rounded-xl border p-8 shadow-2xl">
        {!hideSpinner && <div className="border-muted border-t-primary h-12 w-12 animate-spin rounded-full border-4" />}
        {message && <div className="text-foreground text-sm font-medium">{message}</div>}
      </div>
    </div>
  );
};
