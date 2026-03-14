import type { NextRequest } from "next/server";
import { createOpenApiFetchHandler } from "trpc-to-openapi";
import { appRouter } from "@/server/api/root";
import { createContext } from "@/server/api/trpc";

export const dynamic = "force-dynamic";

const handler = (req: NextRequest) => {
  return createOpenApiFetchHandler({
    endpoint: "/",
    router: appRouter,
    createContext: () => createContext(),
    req,
  });
};

export { handler as GET };
