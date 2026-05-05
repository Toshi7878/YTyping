"use client";
import type { ReactNode } from "react";
import { UAParser } from "ua-parser-js";
import { AtomsHydrator } from "@/lib/jotai-hydrator";
import type { RouterOutputs } from "@/server/api/trpc";
import { DEFAULT_USER_OPTIONS } from "@/server/drizzle/schema";
import { userAgentAtom } from "@/store/user-agent";
import { userOptionsAtom } from "../../store/user-options";

export const AppAtomsHydrator = ({
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
