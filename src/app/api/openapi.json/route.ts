import { generateOpenApiDocument } from "trpc-to-openapi";
import { appRouter } from "@/server/api/root";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const baseUrl = `${url.origin}/api`;

  const doc = generateOpenApiDocument(appRouter, {
    title: "YTyping API",
    version: "1.0.0",
    baseUrl,
    description: "OpenAPI for selected tRPC procedures",
    tags: ["UserStats"],
  });

  return NextResponse.json(doc);
}

