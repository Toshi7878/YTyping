"use client";

import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { useLoadingOverlay, useLoadingState } from "../../lib/globalAtoms";

export { useLoadingOverlay };

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
  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          initial={{ opacity: 0.2 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.2, // 0.2 → 0.1 に短縮
            ease: "easeInOut",
          }}
          style={{
            // CSS animation delay for minimum display time
            animationDelay: isLoading ? "0s" : "0.4s",
          }}
          className="fixed inset-0 top-[40px] z-[25] flex flex-col items-center justify-center bg-black/70"
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
                opacity: { duration: 0.1 }, // 0.2 → 0.1 に短縮
                scale: { duration: 0.1 }, // 0.2 → 0.1 に短縮
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
