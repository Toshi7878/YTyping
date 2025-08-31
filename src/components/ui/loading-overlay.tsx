"use client";

import { AnimatePresence, motion } from "framer-motion";
import React from "react";

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
          className="absolute inset-0 z-[25] flex flex-col items-center justify-center bg-black/70"
          aria-busy="true"
          aria-label="Loading"
        >
          {!hideSpinner && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: 1,
                rotate: 360,
              }}
              exit={{
                opacity: 0,
                scale: 0.8,
              }}
              transition={{
                opacity: { duration: 0.1 },
                scale: { duration: 0.1 },
                rotate: {
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear",
                },
              }}
              className="h-8 w-8 rounded-full border-2 border-white/30 border-t-white"
            />
          )}
          {message && <div className="mt-4 text-sm font-medium text-white">{message}</div>}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
