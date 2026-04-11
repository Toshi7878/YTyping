import type { NextRequest } from "next/server";
import { createOpenApiFetchHandler } from "trpc-to-openapi";
import { auth } from "@/lib/auth";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

export const dynamic = "force-dynamic";

/**
 * 内部専用 REST（`trpc-to-openapi`）。`appRouter` の OpenAPI メタ付き手続きのみ。
 * tRPC クライアント用 `/api/trpc` や公開 REST 用 `/api` とはパスを分離。CORS なし・同一オリジン想定。
 */
const handler = async (req: NextRequest) => {
  return createOpenApiFetchHandler({
    endpoint: "/api/internal",
    router: appRouter,
    createContext: () =>
      createTRPCContext({
        auth,
        headers: req.headers,
      }),
    req,
  });
};

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE, handler as HEAD };
