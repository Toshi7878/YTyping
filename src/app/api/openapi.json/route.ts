import { NextResponse } from "next/server";
import { generateOpenApiDocument } from "trpc-to-openapi";
import { openApiDocumentRouter } from "@/server/api/root";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const baseUrl = `${url.origin}/api`;

  const doc = generateOpenApiDocument(openApiDocumentRouter, {
    title: "YTyping API",
    version: "1.0.0",
    baseUrl,
    description: "OpenAPI for selected tRPC procedures",
    tags: ["Map"],
  });

  return NextResponse.json(doc);
}
