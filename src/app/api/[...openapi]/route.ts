import { createOpenApiFetchHandler } from "trpc-to-openapi";
import { appRouter } from "@/server/api/root";
import { createContext } from "@/server/api/trpc";
import { type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const handler = (req: NextRequest) => {
  return createOpenApiFetchHandler({
    endpoint: "/api",
    router: appRouter,
    createContext: () => createContext(),
    req,
  });
};

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
  handler as OPTIONS,
  handler as HEAD,
};

