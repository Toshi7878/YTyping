import { OpenAPIHandler } from "@orpc/openapi/fetch";
import type { NextRequest } from "next/server";
import { auth } from "@/auth/server";
import { createORPCContext } from "@/server/api/orpc";
import { userStatsRouter } from "@/server/api/routers/user/stats";

export const dynamic = "force-dynamic";

/**
 * 内部専用 REST（sendBeacon 等から呼ぶ統計更新）。
 * oRPC の RPC 用 `/api/orpc` や公開 REST 用 `/api` とはパスを分離。CORS なし・同一オリジン想定。
 */
const openApiHandler = new OpenAPIHandler(userStatsRouter);

const handler = async (req: NextRequest) => {
  const { response } = await openApiHandler.handle(req, {
    prefix: "/api/internal",
    context: await createORPCContext({ auth, headers: req.headers }),
  });

  return response ?? new Response("Not found", { status: 404 });
};

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE, handler as HEAD };
