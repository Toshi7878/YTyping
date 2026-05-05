import { type inferRouterInputs, type inferRouterOutputs, initTRPC, TRPCError } from "@trpc/server";
import { headers } from "next/headers";
import superjson from "superjson";
import type { OpenApiMeta } from "trpc-to-openapi";
import { type Auth, getSession } from "@/server/auth";
import { db } from "../drizzle/client";
import type { RateLimitDef } from "./lib/rate-limit-config";
import { createUpstashRateLimiter } from "./lib/upstash-rate-limit";
import type { AppRouter } from "./root";

export const createTRPCContext = async (opts: { headers: Headers; auth: Auth }) => {
  const authApi = opts.auth.api;
  const session = await getSession();

  return { authApi, session, db, headers: opts.headers };
};

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;
const t = initTRPC.context<TRPCContext>().meta<OpenApiMeta>().create({
  transformer: superjson,
});

t.procedure.use((opts) => opts.next());

export const { router, createCallerFactory } = t;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use((opts) => {
  if (!opts.ctx.session) {
    throw new Error("認証が必要です");
  }

  return opts.next({
    ctx: { ...opts.ctx, session: opts.ctx.session },
  });
});

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

const getRequestIp = async () => {
  try {
    const requestHeaders = await headers();
    const forwardedFor =
      requestHeaders.get("x-forwarded-for") ??
      requestHeaders.get("x-real-ip") ??
      requestHeaders.get("cf-connecting-ip");

    return forwardedFor?.split(",")[0]?.trim() ?? null;
  } catch {
    return null;
  }
};

export const createRateLimitMiddleware = ({ keyPrefix, max, window }: RateLimitDef) => {
  const ratelimit = createUpstashRateLimiter(keyPrefix, max, window);

  return t.middleware(async ({ ctx, path, next }) => {
    if (!ratelimit) {
      return next();
    }
    const { session } = ctx;

    const actorKey = session ? `user:${session.user.id}` : `ip:${(await getRequestIp()) ?? "unknown"}`;
    const result = await ratelimit.limit(`${path}:${actorKey}`);

    if (!result.success) {
      const retryAfterSeconds = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));

      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: `Rate limit exceeded. Retry after ${retryAfterSeconds} seconds.`,
      });
    }

    return next();
  });
};
