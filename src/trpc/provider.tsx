"use client";
import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchStreamLink, loggerLink } from "@trpc/client";
import { createTRPCContext, createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type React from "react";
import { useState } from "react";
import SuperJSON from "superjson";
import { env } from "@/env";
import type { AppRouter } from "@/server/api/root";
import { getBaseUrl } from "@/utils/get-base-url";
import { makeQueryClient } from "./query-client";

let browserQueryClient: QueryClient | undefined;
export const getQueryClient = () => {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  }
  // Browser: make a new query client if we don't already have one
  // This is very important, so we don't re-make a new client if React
  // suspends during the initial render. This may not be needed if we
  // have a suspense boundary BELOW the creation of the query client
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
};

const { useTRPC, TRPCProvider } = createTRPCContext<AppRouter>();

export { useTRPC };

const trpcClient = createTRPCClient<AppRouter>({
  links: [
    loggerLink({
      enabled: (op) => env.NODE_ENV === "development" || (op.direction === "down" && op.result instanceof Error),
    }),
    httpBatchStreamLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: SuperJSON,
    }),
  ],
});

const trpcOptions = createTRPCOptionsProxy({
  client: trpcClient,
  queryClient: getQueryClient,
});

export const getTRPCClient = () => trpcClient;
export const getTRPCOptions = () => trpcOptions;

// biome-ignore lint/style/noDefaultExport: <名前空間が被るため>
export default function TRPCReactProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const [client] = useState(() => trpcClient);
  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={client} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
