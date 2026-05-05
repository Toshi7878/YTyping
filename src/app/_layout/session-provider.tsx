"use client";

import type { getSession } from "@/lib/auth";
import { SessionContext } from "@/lib/auth-client";

export function SessionProvider({
  session,
  children,
}: {
  session: Awaited<ReturnType<typeof getSession>>;
  children: React.ReactNode;
}) {
  return <SessionContext value={session}>{children}</SessionContext>;
}
