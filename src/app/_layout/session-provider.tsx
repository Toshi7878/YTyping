"use client";

import { SessionContext } from "@/lib/auth-client";
import type { getSession } from "@/server/auth";

export function SessionProvider({
  session,
  children,
}: {
  session: Awaited<ReturnType<typeof getSession>>;
  children: React.ReactNode;
}) {
  return <SessionContext value={session}>{children}</SessionContext>;
}
