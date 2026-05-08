import { NextResponse } from "next/server";
import { generateOpenApiDocument } from "trpc-to-openapi";
import { TRPC_GLOBAL_RATE_LIMIT } from "@/server/api/lib/rate-limit-config";
import { openApiRouter } from "@/server/api/root";

export const dynamic = "force-dynamic";

/** createOpenApiFetchHandler ではそのまま公開し、openapi.json と API Docs ページの一覧からだけ除くパス */
const OPENAPI_PATHS_OMITTED_FROM_DOCUMENT = new Set(["/morph/tokenize"]);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const baseUrl = `${url.origin}/api`;

  const doc = generateOpenApiDocument(openApiRouter, {
    title: "YTyping API",
    version: "1.0.0",
    baseUrl,
    description: "OpenAPI for selected tRPC procedures",
    tags: ["Map"],
    filter: ({ metadata }) => {
      const openApiPath = metadata.openapi?.path;
      if (!openApiPath) return true;
      return !OPENAPI_PATHS_OMITTED_FROM_DOCUMENT.has(openApiPath);
    },
  });

  // trpc-to-openapi はエラーコード単位で response をキャッシュするため
  // エンドポイントごとの 429 description が反映されない。
  // ポストプロセスで上書きし、x-rateLimit 拡張も追加する。
  for (const [, methods] of Object.entries(doc.paths ?? {})) {
    for (const [, operation] of Object.entries(methods ?? {})) {
      const op = operation as Record<string, unknown>;

      op["x-rateLimit"] = { max: TRPC_GLOBAL_RATE_LIMIT.max, window: TRPC_GLOBAL_RATE_LIMIT.window };

      const responses = op.responses as Record<string, { description?: string }> | undefined;
      if (responses?.["429"]) {
        responses["429"] = {
          ...responses["429"],
          description: `Too many requests (${TRPC_GLOBAL_RATE_LIMIT.max} requests / ${TRPC_GLOBAL_RATE_LIMIT.window})`,
        };
      }
    }
  }

  return NextResponse.json(doc);
}
