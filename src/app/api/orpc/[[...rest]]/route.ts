import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import type { NextRequest } from "next/server";
import { auth } from "@/auth/server";
import { createORPCContext } from "@/server/api/orpc";
import { appRouter } from "@/server/api/root";

const handler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error(">>> oRPC Error", error);
    }),
  ],
});

const handleRequest = async (req: NextRequest) => {
  const { response } = await handler.handle(req, {
    prefix: "/api/orpc",
    context: await createORPCContext({ auth, headers: req.headers }),
  });

  return response ?? new Response("Not found", { status: 404 });
};

export { handleRequest as GET, handleRequest as POST };
