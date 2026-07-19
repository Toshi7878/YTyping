import { NextResponse } from "next/server";
import { generateOpenApiDocument } from "trpc-to-openapi";
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

  return NextResponse.json(doc);
}
