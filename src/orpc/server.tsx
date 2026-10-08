import "server-only";
import { createRouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import type { ReactNode } from "react";
import { cache } from "react";
import { auth } from "@/auth/server";
import { createORPCContext } from "@/server/api/orpc";
import { appRouter } from "@/server/api/root";
import { makeQueryClient } from "./query-client";

/**
 * React Server Component からの呼び出し用コンテキスト。
 */
const createContext = cache(async () => {
  const heads = new Headers(await headers());
  heads.set("x-orpc-source", "rsc");

  return createORPCContext({ headers: heads, auth });
});

export const getQueryClient = cache(makeQueryClient);

/** RSC から直接呼び出すサーバー用クライアント（HTTP を経由しない） */
export const caller = createRouterClient(appRouter, { context: createContext });

export const orpc = createTanstackQueryUtils(caller);

export function HydrateClient(props: { children: ReactNode }) {
  const queryClient = getQueryClient();
  return <HydrationBoundary state={dehydrate(queryClient)}>{props.children}</HydrationBoundary>;
}

type PrefetchOptions = { queryKey: readonly unknown[] };

const isInfiniteQuery = (queryOptions: PrefetchOptions) =>
  (queryOptions.queryKey[1] as { type?: string } | undefined)?.type === "infinite";

// @orpc/tanstack-query と @tanstack/react-query の型が別インスタンス扱いになるため、ここで型を吸収する
export function prefetch(queryOptions: PrefetchOptions) {
  const queryClient = getQueryClient();
  if (isInfiniteQuery(queryOptions)) {
    void queryClient.prefetchInfiniteQuery(queryOptions as never);
  } else {
    void queryClient.prefetchQuery(queryOptions as never);
  }
}

export async function prefetchAsync(queryOptions: PrefetchOptions) {
  const queryClient = getQueryClient();
  if (isInfiniteQuery(queryOptions)) {
    return queryClient.prefetchInfiniteQuery(queryOptions as never);
  }
  return queryClient.prefetchQuery(queryOptions as never);
}
