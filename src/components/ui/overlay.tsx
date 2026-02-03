"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

// --- Store ---

interface OverlayState {
  type: "loading" | "message";
  description: ReactNode;
}

const store: { state?: OverlayState; onStoreChange?: () => void } = {};

const setState = (nextState: OverlayState | undefined) => {
  store.state = nextState;
  store.onStoreChange?.();
};

// --- Public API ---

export const overlay = {
  loading: (description: ReactNode) => setState({ type: "loading", description }),
  message: (description: ReactNode) => setState({ type: "message", description }),
  hide: () => setState(undefined),
};

// --- Host Component ---

export const OverlayHost = () => {
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
    <OverlayView
      show={!!state}
      showSpinner={state?.type === "loading"}
      description={state?.description}
      position="fixed"
    />
  );
}

// --- Local Provider (相対配置用) ---

interface LoadingOverlayProviderProps {
  isLoading: boolean;
  description: ReactNode;
  children: ReactNode;
  asChild?: boolean;
}

export const LoadingOverlayProvider = ({ isLoading, description, children, asChild }: LoadingOverlayProviderProps) => {
  const overlay = <OverlayView show={isLoading} showSpinner={true} description={description} position="absolute" />;

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

interface OverlayProps {
  show: boolean;
  showSpinner: boolean;
  description: ReactNode;
  position: "fixed" | "absolute";
}

const OverlayView = ({ show, showSpinner, description, position }: OverlayProps) => (
  <AnimatePresence mode="wait">
    {show && (
      <motion.div
        initial={{ opacity: 0.2 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className={cn("inset-0 z-25 flex flex-col items-center justify-center bg-overlay-background", position)}
        aria-busy="true"
        aria-label="Loading"
      >
        {showSpinner && <Spinner size="xl" />}
        <div className="mt-4 font-medium text-overlay-foreground">{description}</div>
      </motion.div>
    )}
  </AnimatePresence>
);
