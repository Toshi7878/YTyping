import { OpenAPIHandler } from "@orpc/openapi/fetch";
import type { NextRequest } from "next/server";
import { auth } from "@/auth/server";
import { createORPCContext } from "@/server/api/orpc";
import { openApiRouter } from "@/server/api/root";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
} as const;

const withCors = (response: Response) => {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    headers.set(key, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

const openApiHandler = new OpenAPIHandler(openApiRouter);

const handler = async (req: NextRequest) => {
  const { response } = await openApiHandler.handle(req, {
    prefix: "/api",
    context: await createORPCContext({ auth, headers: req.headers }),
  });

  return withCors(response ?? new Response("Not found", { status: 404 }));
};

const optionsHandler = () => new Response(null, { status: 204, headers: CORS_HEADERS });

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
  handler as HEAD,
  optionsHandler as OPTIONS,
};
