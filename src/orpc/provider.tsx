"use client";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { QueryClient } from "@tanstack/react-query";
import { environmentManager, QueryClientProvider } from "@tanstack/react-query";
import type React from "react";
import type { AppRouter } from "@/server/api/root";
import { getBaseUrl } from "@/utils/get-base-url";
import { makeQueryClient } from "./query-client";

let browserQueryClient: QueryClient | undefined;
export const getQueryClient = () => {
  if (environmentManager.isServer()) {
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

const link = new RPCLink({ url: `${getBaseUrl()}/api/orpc` });

export const orpcClient: RouterClient<AppRouter> = createORPCClient(link);

export const orpc = createTanstackQueryUtils(orpcClient);

// biome-ignore lint/style/noDefaultExport: <名前空間が被るため>
export default function ORPCReactProvider({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={getQueryClient()}>{children}</QueryClientProvider>;
}
