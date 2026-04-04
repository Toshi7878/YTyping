type WindowUnit = "ms" | "s" | "m" | "h";

export type RateLimitDef = {
  keyPrefix: string;
  max: number;
  window: `${number} ${WindowUnit}`;
};

/**
 * OpenAPI path → HTTP method → レート制限定義
 * ミドルウェア生成・OpenAPI ドキュメント・api-docs ページの単一ソース
 */
export const OPENAPI_RATE_LIMITS = {
  "/maps": {
    get: { keyPrefix: "ratelimit:map-list:get", max: 60, window: "60 s" },
  },
  "/maps/{mapId}": {
    get: { keyPrefix: "ratelimit:map-item:get", max: 120, window: "60 s" },
  },
  "/maps/{mapId}/json": {
    get: { keyPrefix: "ratelimit:map-item:get-json", max: 30, window: "60 s" },
  },
  "/morph/tokenize": {
    post: { keyPrefix: "ratelimit:morph-tokenize:post", max: 60, window: "60 s" },
  },
} as const satisfies Record<string, Record<string, RateLimitDef>>;
