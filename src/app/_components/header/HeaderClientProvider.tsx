"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const headerQueryClient = new QueryClient();

// export const runtime = "edge";

const HeaderClientProvider = ({ children }) => {
  return <QueryClientProvider client={headerQueryClient}>{children}</QueryClientProvider>;
};

export default HeaderClientProvider;
