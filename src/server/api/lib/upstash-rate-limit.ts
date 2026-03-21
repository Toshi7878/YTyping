import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@/env";

const isRateLimitEnabled = Boolean(env.KV_REST_API_URL && env.KV_REST_API_TOKEN);

const redis = isRateLimitEnabled
  ? new Redis({
      url: env.KV_REST_API_URL,
      token: env.KV_REST_API_TOKEN,
    })
  : null;

export const createUpstashRateLimiter = (
  prefix: string,
  max: number,
  window: `${number} ${"ms" | "s" | "m" | "h"}`,
) => {
  if (!redis) {
    return null;
  }

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(max, window),
    prefix,
    ephemeralCache: new Map(),
  });
};
