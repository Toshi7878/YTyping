"use client";

import { SessionContext } from "@/auth/client";
import type { getSession } from "@/auth/server";

export function SessionProvider({
  session,
  children,
}: {
  session: Awaited<ReturnType<typeof getSession>>;
  children: React.ReactNode;
}) {
  return <SessionContext value={session}>{children}</SessionContext>;
}
