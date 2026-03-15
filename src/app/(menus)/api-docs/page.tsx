import { headers } from "next/headers";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { CardWithContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table/table";
import { H1, P, Small } from "@/components/ui/typography";

const HTTP_METHODS = ["get", "post", "put", "patch", "delete"] as const;

type HttpMethod = (typeof HTTP_METHODS)[number];

type OpenApiRateLimit = {
  max: number;
  window: string;
};

type OpenApiOperation = {
  summary?: string;
  tags?: string[];
  "x-rateLimit"?: OpenApiRateLimit;
  parameters?: Array<{
    in?: string;
    name?: string;
    required?: boolean;
    schema?: OpenApiSchema;
  }>;
  responses?: Record<string, OpenApiResponse>;
};

type OpenApiSchema = {
  type?: string;
  enum?: string[];
  anyOf?: OpenApiSchema[];
  items?: OpenApiSchema;
  properties?: Record<string, OpenApiSchema>;
  required?: string[];
  additionalProperties?: boolean;
  $ref?: string;
};

type OpenApiResponse = {
  description?: string;
  content?: Record<string, { schema?: OpenApiSchema }>;
};

type OpenApiDocument = {
  servers?: Array<{ url?: string }>;
  paths?: Record<string, Partial<Record<HttpMethod, OpenApiOperation>>>;
};

const METHOD_BADGE_VARIANT = {
  get: "secondary",
  post: "default",
  put: "accent-light",
  patch: "accent-dark",
  delete: "destructive",
} as const satisfies Record<HttpMethod, string>;

const getSchemaTypeLabel = (schema?: OpenApiSchema): string => {
  if (!schema) return "unknown";
  if (schema.$ref) return schema.$ref.split("/").at(-1) ?? schema.$ref;
  if (schema.enum?.length) return schema.enum.map((value) => `"${value}"`).join(" | ");
  if (schema.anyOf?.length) {
    const labels = schema.anyOf
      .map((item) => getSchemaTypeLabel(item))
      .filter((label) => label !== "null" && label !== "undefined" && label !== "");
    return labels.join(" | ");
  }
  if (schema.type === "array") return `${getSchemaTypeLabel(schema.items)}[]`;
  if (schema.type === "null") return "";
  if (schema.type) return schema.type;
  return "unknown";
};

const collectSchemaFields = (
  schema?: OpenApiSchema,
  parentPath = "",
): Array<{ path: string; type: string; required: boolean }> => {
  if (!schema?.properties) return [];

  return Object.entries(schema.properties).flatMap(([name, childSchema]) => {
    const path = parentPath ? `${parentPath}.${name}` : name;
    const isRequired = schema.required?.includes(name) ?? false;
    const current = { path, type: getSchemaTypeLabel(childSchema), required: isRequired };

    if (childSchema.type === "object") {
      return [current, ...collectSchemaFields(childSchema, path)];
    }
    if (childSchema.type === "array" && childSchema.items?.type === "object") {
      return [current, ...collectSchemaFields(childSchema.items, `${path}[]`)];
    }
    return [current];
  });
};

export default async function Page() {
  const requestHeaders = await headers();
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const host = requestHeaders.get("host");
  const baseUrl = host ? `${protocol}://${host}` : "http://localhost:3000";
  const openApiDoc = (await fetch(`${baseUrl}/api/openapi.json`, { cache: "no-store" }).then((res) =>
    res.json(),
  )) as OpenApiDocument;
  const apiBaseUrl = openApiDoc.servers?.[0]?.url ?? `${baseUrl}/api`;

  const endpoints = Object.entries(openApiDoc.paths ?? {}).flatMap(([path, pathItem]) =>
    HTTP_METHODS.flatMap((method) => {
      const operation = pathItem?.[method];
      if (!operation) return [];
      return [
        {
          path,
          method,
          summary: operation.summary ?? "",
          tag: operation.tags?.[0] ?? "",
          rateLimit: operation["x-rateLimit"],
          parameters: operation.parameters ?? [],
          responses: operation.responses ? Object.entries(operation.responses) : [],
          successSchema: operation.responses?.["200"]?.content?.["application/json"]?.schema,
        },
      ];
    }),
  );

  return (
    <article className="mx-auto max-w-7xl space-y-4">
      <H1>API Docs</H1>

      <CardWithContent className={{ cardContent: "space-y-8" }}>
        <Accordion type="single" collapsible className="w-full">
          {endpoints.map((endpoint) => (
            <AccordionItem key={`${endpoint.method}-${endpoint.path}`} value={`${endpoint.method}-${endpoint.path}`}>
              <AccordionTrigger className="gap-4 rounded-md border border-border/60 bg-muted/20 px-4 py-3 transition-colors hover:bg-muted/40">
                <div className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={METHOD_BADGE_VARIANT[endpoint.method]} size="xs">
                      {endpoint.method.toUpperCase()}
                    </Badge>
                    <code className="text-sm">
                      {apiBaseUrl}
                      {endpoint.path}
                    </code>
                  </div>
                  {endpoint.summary ? <P className="text-muted-foreground text-sm">{endpoint.summary}</P> : null}
                </div>
              </AccordionTrigger>

              <AccordionContent className="space-y-4 pt-2">
                {endpoint.parameters.length > 0 ? (
                  <>
                    <Small>Parameters</Small>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>In</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {endpoint.parameters.map((param) => (
                          <TableRow key={`${param.in}-${param.name}`}>
                            <TableCell>
                              <code>{param.name}</code>
                            </TableCell>
                            <TableCell>{param.in}</TableCell>
                            <TableCell>{getSchemaTypeLabel(param.schema)}</TableCell>
                            <TableCell>
                              {param.required ? (
                                <Badge variant="secondary" size="xs">
                                  required
                                </Badge>
                              ) : (
                                <Badge variant="outline" size="xs">
                                  optional
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </>
                ) : null}

                {endpoint.responses.length > 0 ? (
                  <>
                    {endpoint.parameters.length > 0 ? <Separator /> : null}
                    <Small>Responses</Small>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Status</TableHead>
                          <TableHead>Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {endpoint.responses.map(([status, response]) => (
                          <TableRow key={status}>
                            <TableCell>
                              <Badge variant={status.startsWith("2") ? "secondary" : "destructive-soft"} size="xs">
                                {status}
                              </Badge>
                            </TableCell>
                            <TableCell>{response.description}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </>
                ) : null}

                {endpoint.successSchema ? (
                  <>
                    <Separator />
                    <Small>Success Response Schema</Small>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Field</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {collectSchemaFields(endpoint.successSchema).map((field) => (
                          <TableRow key={field.path}>
                            <TableCell>
                              <code>{field.path}</code>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{field.type}</TableCell>
                            <TableCell>
                              {field.required ? (
                                <Badge variant="outline" size="xs">
                                  required
                                </Badge>
                              ) : null}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </>
                ) : null}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardWithContent>
    </article>
  );
}
