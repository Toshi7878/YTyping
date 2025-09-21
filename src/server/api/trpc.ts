import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import type { OpenApiMeta } from "trpc-to-openapi";
import { auth } from "../auth";
import { db as drizzleDb } from "../drizzle/client";
import type { AppRouter } from "./root";

export const createContext = async () => {
  const session = await auth();

  const user = { ...session?.user, id: Number(session?.user.id ?? 0) };
  return {
    db: drizzleDb,
    user,
  };
};

type Context = Awaited<ReturnType<typeof createContext>>;
const t = initTRPC.context<Context>().meta<OpenApiMeta>().create({
  transformer: superjson,
});

t.procedure.use((opts) => {
  opts.ctx;

  return opts.next();
});

export const router = t.router;
export const createCallerFactory = t.createCallerFactory;

export const publicProcedure = t.procedure;
export const optionalAuthProcedure = t.procedure.use((opts) => {
  return opts.next({
    ctx: {
      db: drizzleDb,
      user: opts.ctx.user ? { ...opts.ctx.user, id: Number(opts.ctx.user.id) } : undefined,
    },
  });
});

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
export type RouterOutPuts = inferRouterOutputs<AppRouter>;
