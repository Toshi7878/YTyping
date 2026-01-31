"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

// --- Store ---

interface LoadingState {
  message?: ReactNode;
  hideSpinner?: boolean;
}

const store: { state?: LoadingState; onStoreChange?: () => void } = {};

const setState = (nextState: LoadingState | undefined) => {
  store.state = nextState;
  store.onStoreChange?.();
};

// --- Public API ---

export const loadingOverlay = {
  show: ({ message, hideSpinner }: LoadingState = {}) => setState({ message, hideSpinner }),
  hide: () => setState(undefined),
};

// --- Host Component (layout.tsx に配置) ---

export function LoadingOverlayHost() {
  const state = useSyncExternalStore(
    (onStoreChange) => {
      store.onStoreChange = onStoreChange;
      return () => {
        store.onStoreChange = undefined;
      };
    },
    () => store.state,
    () => store.state,
  );

  return (
    <LoadingOverlay isLoading={!!state} message={state?.message} hideSpinner={state?.hideSpinner} position="fixed" />
  );
}

// --- Local Provider (相対配置用) ---

interface LoadingOverlayProviderProps {
  isLoading: boolean;
  message?: ReactNode;
  hideSpinner?: boolean;
  children?: ReactNode;
  asChild?: boolean;
}

export const LoadingOverlayProvider = ({
  isLoading,
  message,
  hideSpinner,
  children,
  asChild,
}: LoadingOverlayProviderProps) => {
  const overlay = (
    <LoadingOverlay isLoading={isLoading} message={message} hideSpinner={hideSpinner} position="absolute" />
  );

  return asChild ? (
    <>
      {children}
      {overlay}
    </>
  ) : (
    <div className="relative">
      {children}
      {overlay}
    </div>
  );
};

// --- Shared UI ---

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: ReactNode;
  hideSpinner?: boolean;
  position: "fixed" | "absolute";
}

const LoadingOverlay = ({ isLoading, message, hideSpinner, position }: LoadingOverlayProps) => (
  <AnimatePresence mode="wait">
    {isLoading && (
      <motion.div
        initial={{ opacity: 0.2 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className={cn("inset-0 z-25 flex flex-col items-center justify-center bg-overlay-background", position)}
        aria-busy="true"
        aria-label="Loading"
      >
        {!hideSpinner && <Spinner size="xl" />}
        {message && <div className="mt-4 font-medium text-overlay-foreground">{message}</div>}
      </motion.div>
    )}
  </AnimatePresence>
);
