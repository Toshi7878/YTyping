import type { NextRequest } from "next/server";
import { createOpenApiFetchHandler } from "trpc-to-openapi";
import { openApiRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";
import { auth } from "@/server/auth";

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

const handler = async (req: NextRequest) => {
  const response = await createOpenApiFetchHandler({
    endpoint: "/api",
    router: openApiRouter,
    createContext: () =>
      createTRPCContext({
        auth,
        headers: req.headers,
      }),
    req,
  });

  return withCors(response);
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
