"use client";

import { AnimatePresence, motion } from "framer-motion";
import type React from "react";
import { Spinner } from "./spinner";

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: React.ReactNode;
  hideSpinner?: boolean;
}

interface LoadingOverlayProviderProps extends LoadingOverlayProps {
  children?: React.ReactNode;
  asChild?: boolean;
}

export const LoadingOverlayProvider = ({
  isLoading,
  message,
  hideSpinner,
  children,
  asChild,
}: LoadingOverlayProviderProps) => {
  const overlay = <LoadingOverlay isLoading={isLoading} message={message} hideSpinner={hideSpinner} />;

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

const LoadingOverlay = ({ isLoading, message, hideSpinner }: LoadingOverlayProps) => {
  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          initial={{ opacity: 0.2 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.4,
            ease: "easeInOut",
          }}
          style={{
            animationDelay: isLoading ? "0s" : "0.4s",
          }}
          className="bg-overlay-background absolute inset-0 z-[25] flex flex-col items-center justify-center"
          aria-busy="true"
          aria-label="Loading"
        >
          {!hideSpinner && <Spinner size="xl" />}
          {message && <div className="text-overlay-foreground mt-4 font-medium">{message}</div>}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
