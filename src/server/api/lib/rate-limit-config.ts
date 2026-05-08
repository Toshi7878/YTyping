type WindowUnit = "ms" | "s" | "m" | "h";

export type RateLimitDef = {
  keyPrefix: string;
  max: number;
  window: `${number} ${WindowUnit}`;
};

export const TRPC_GLOBAL_RATE_LIMIT: RateLimitDef = {
  keyPrefix: "ratelimit:trpc:global",
  max: 60,
  window: "60 s",
};

