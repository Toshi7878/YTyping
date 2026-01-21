"use client";
import type { ReactNode } from "react";
import { UAParser } from "ua-parser-js";
import { AtomsHydrator } from "@/components/shared/jotai";
import { LoadingOverlayProvider } from "@/components/ui/loading-overlay";
import { useGlobalLoadingState, userOptionsAtom } from "@/lib/atoms/global-atoms";
import { userAgentAtom } from "@/lib/atoms/user-agent";
import type { RouterOutputs } from "@/server/api/trpc";
import { DEFAULT_USER_OPTIONS } from "@/server/drizzle/schema";
import { useClearSelectionOnNavigate } from "@/utils/hooks/use-clear-selection-on-navigate";

interface MainProviderProps {
  children: ReactNode;
}

export const MainProvider = ({ children }: MainProviderProps) => {
  useClearSelectionOnNavigate();
  const { message, isLoading, hideSpinner } = useGlobalLoadingState();

  return (
    <LoadingOverlayProvider message={message} isLoading={isLoading} hideSpinner={hideSpinner} asChild>
      {children}
    </LoadingOverlayProvider>
  );
};

export const JotaiProvider = ({
  children,
  userOptions,
  userAgent,
}: {
  children: ReactNode;
  userOptions: RouterOutputs["user"]["option"]["getForSession"];
  userAgent: string;
}) => {
  return (
    <AtomsHydrator
      atomValues={[
        [userAgentAtom, new UAParser(userAgent)],
        [userOptionsAtom, userOptions ?? DEFAULT_USER_OPTIONS],
      ]}
      dangerouslyForceHydrate
    >
      {children}
    </AtomsHydrator>
  );
};
