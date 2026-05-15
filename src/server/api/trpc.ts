import { type inferRouterInputs, type inferRouterOutputs, initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { OpenApiMeta } from "trpc-to-openapi";
import { type Auth, getSession } from "@/auth/server";
import { db } from "../drizzle/client";
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

export const adminProcedure = t.procedure.use((opts) => {
  if (opts.ctx.session?.user.role !== "ADMIN") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }

  return opts.next({
    ctx: { ...opts.ctx, session: opts.ctx.session },
  });
});

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
