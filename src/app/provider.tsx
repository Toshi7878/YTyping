"use client";
import type React from "react";
import { AtomsHydrator } from "@/components/shared/jotai";
import { userOptionsAtom } from "@/lib/atoms/global-atoms";
import type { RouterOutputs } from "@/server/api/trpc";
import { DEFAULT_USER_OPTIONS } from "@/server/drizzle/schema";

interface JotaiProviderProps {
  children: React.ReactNode;
  userOptions: RouterOutputs["user"]["option"]["getForSession"];
}

export const JotaiProvider = ({ children, userOptions }: JotaiProviderProps) => {
  return (
    <AtomsHydrator atomValues={[[userOptionsAtom, userOptions ?? DEFAULT_USER_OPTIONS]]} dangerouslyForceHydrate>
      {children}
    </AtomsHydrator>
  );
};
