import { inferRouterInputs, inferRouterOutputs, initTRPC } from "@trpc/server";
import superjson from "superjson";
import { auth } from "../auth";
import { prisma } from "../db";
import type { AppRouter } from "./root";

const createContext = async () => {
  const session = await auth();

  const user = { ...session?.user, id: Number(session?.user.id ?? 0) };
  return {
    db: prisma,
    user,
  };
};

type Context = Awaited<ReturnType<typeof createContext>>;
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

t.procedure.use((opts) => {
  opts.ctx;

  return opts.next();
});

export const router = t.router;
export const createCallerFactory = t.createCallerFactory;

export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(function isAuthed(opts) {
  if (!opts.ctx.user) {
    throw new Error("認証が必要です");
  }

  return opts.next({
    ctx: {
      db: prisma,
      user: { ...opts.ctx.user, id: Number(opts.ctx.user.id) },
    },
  });
});
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutPuts = inferRouterOutputs<AppRouter>;
