import { OpenAPIGenerator } from "@orpc/openapi";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { NextResponse } from "next/server";
import { openApiRouter } from "@/server/api/root";

export const dynamic = "force-dynamic";

/** OpenAPIHandler ではそのまま公開し、openapi.json と API Docs ページの一覧からだけ除くパス */
const OPENAPI_PATHS_OMITTED_FROM_DOCUMENT = new Set(["/morph/tokenize"]);

const generator = new OpenAPIGenerator({ schemaConverters: [new ZodToJsonSchemaConverter()] });

export async function GET(request: Request) {
  const url = new URL(request.url);
  const baseUrl = `${url.origin}/api`;

  const doc = await generator.generate(openApiRouter, {
    info: {
      title: "YTyping API",
      version: "1.0.0",
      description: "OpenAPI for selected oRPC procedures",
    },
    servers: [{ url: baseUrl }],
    filter: ({ contract }) => {
      const openApiPath = contract["~orpc"].route.path;
      if (!openApiPath) return true;
      return !OPENAPI_PATHS_OMITTED_FROM_DOCUMENT.has(openApiPath);
    },
  });

  return NextResponse.json(doc);
}
