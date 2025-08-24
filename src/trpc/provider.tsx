"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchStreamLink, loggerLink } from "@trpc/client";
import React, { useState } from "react";

import { env } from "@/env";
import { AppRouter } from "@/server/api/root";
import { getBaseUrl } from "@/utils/getBaseUrl";
import SuperJSON from "superjson";
import { createQueryClient } from "./query-client";
import { TRPCProvider } from "./trpc";

// function getQueryClient() {
//   if (typeof window === "undefined") {
//     // Server: always make a new query client
//     return createQueryClient();
//   } else {
//     // Browser: make a new query client if we don't already have one
//     // This is very important, so we don't re-make a new client if React
//     // suspends during the initial render. This may not be needed if we
//     // have a suspense boundary BELOW the creation of the query client
//     if (!browserQueryClient) browserQueryClient = makeQueryClient();
//     return browserQueryClient;
//   }
// }

export default function Provider({ children }: { children: React.ReactNode }) {
  const queryClient = createQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        loggerLink({
          enabled: (op) => env.NODE_ENV === "development" || (op.direction === "down" && op.result instanceof Error),
        }),
        httpBatchStreamLink({
          transformer: SuperJSON,
          url: getBaseUrl() + "/api/trpc",
          headers() {
            const headers = new Headers();
            headers.set("x-trpc-source", "nextjs-react");
            return headers;
          },
        }),
      ],
    }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
