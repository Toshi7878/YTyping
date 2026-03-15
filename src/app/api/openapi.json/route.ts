import { NextResponse } from "next/server";
import { generateOpenApiDocument } from "trpc-to-openapi";
import { OPENAPI_RATE_LIMITS, type RateLimitDef } from "@/server/api/lib/rate-limit-config";
import { openApiRouter } from "@/server/api/root";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const baseUrl = `${url.origin}/api`;

  const doc = generateOpenApiDocument(openApiRouter, {
    title: "YTyping API",
    version: "1.0.0",
    baseUrl,
    description: "OpenAPI for selected tRPC procedures",
    tags: ["Map"],
  });

  // trpc-to-openapi はエラーコード単位で response をキャッシュするため
  // エンドポイントごとの 429 description が反映されない。
  // ポストプロセスで上書きし、x-rateLimit 拡張も追加する。
  for (const [path, methods] of Object.entries(doc.paths ?? {})) {
    for (const [method, operation] of Object.entries(methods ?? {})) {
      const rateLimits = OPENAPI_RATE_LIMITS as Record<string, Record<string, RateLimitDef> | undefined>;
      const rateLimitDef = rateLimits[path]?.[method];
      if (!rateLimitDef) continue;

      const op = operation as Record<string, unknown>;

      // x-rateLimit 拡張（api-docs ページから参照）
      op["x-rateLimit"] = { max: rateLimitDef.max, window: rateLimitDef.window };

      // 429 description をエンドポイント固有の値で上書き
      const responses = op.responses as Record<string, { description?: string }> | undefined;
      if (responses?.["429"]) {
        responses["429"] = {
          ...responses["429"],
          description: `Too many requests (${rateLimitDef.max} requests / ${rateLimitDef.window})`,
        };
      }
    }
  }

  return NextResponse.json(doc);
}
