import { appRouter } from "@/server/api/root";
import { createCallerFactory } from "@/server/api/trpc";
import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cache } from "react";
import { createQueryClient } from "./query-client";

export const serverApi = createCallerFactory(appRouter)(async () => {
  const session = await auth();

  const user = { ...session?.user, id: Number(session?.user.id ?? 0) };
  return {
    db: prisma,
    user,
  };
});

const getQueryClient = cache(createQueryClient);

export function HydrateClient(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return <HydrationBoundary state={dehydrate(queryClient)}>{props.children}</HydrationBoundary>;
}
