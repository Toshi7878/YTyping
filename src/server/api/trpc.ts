import { type inferRouterInputs, type inferRouterOutputs, initTRPC, TRPCError } from "@trpc/server";
import { headers } from "next/headers";
import superjson from "superjson";
import type { OpenApiMeta } from "trpc-to-openapi";
import { auth } from "../auth";
import { db as drizzleDb } from "../drizzle/client";
import type { RateLimitDef } from "./lib/rate-limit-config";
import { createUpstashRateLimiter } from "./lib/upstash-rate-limit";
import type { AppRouter } from "./root";

export const createContext = async () => {
  const session = await auth();
  if (!session) {
    return { db: drizzleDb, user: null };
  }

  return { db: drizzleDb, user: { ...session.user, id: Number(session.user.id) } };
};

export type TRPCContext = Awaited<ReturnType<typeof createContext>>;
const t = initTRPC.context<TRPCContext>().meta<OpenApiMeta>().create({
  transformer: superjson,
});

t.procedure.use((opts) => opts.next());

export const { router, createCallerFactory } = t;

export const publicProcedure = t.procedure;

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

    const actorKey = ctx.user ? `user:${ctx.user.id}` : `ip:${(await getRequestIp()) ?? "unknown"}`;
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

export const protectedProcedure = t.procedure.use((opts) => {
  if (!opts.ctx.user) {
    throw new Error("認証が必要です");
  }

  return opts.next({
    ctx: {
      db: drizzleDb,
      user: { ...opts.ctx.user, id: Number(opts.ctx.user.id) },
    },
  });
});

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
