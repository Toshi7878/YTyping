"use client";
import { getDefaultStore } from "jotai";
import type { ReactNode } from "react";
import { UAParser } from "ua-parser-js";
import { userAgentAtom } from "@/app/_layout/user-agent";
import { AtomsHydrator } from "@/lib/jotai";
import type { RouterOutputs } from "@/server/api/trpc";
import { DEFAULT_USER_OPTIONS } from "@/server/drizzle/schema";
import { userOptionsAtom } from "./user-options";

export const store = getDefaultStore();

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
