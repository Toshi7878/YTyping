import { inferRouterInputs, inferRouterOutputs, initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { auth } from "../auth";
import { AppRouter } from "./root";

const t = initTRPC.create({
  transformer: superjson,
});

const isAuthed = t.middleware(async (opts) => {
  const session = await auth();

  if (!session || !session.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "認証が必要です",
    });
  }

  return opts.next({
    ctx: {
      session,
      user: session.user,
    },
  });
});

export const router = t.router;
export const createCallerFactory = t.createCallerFactory;

export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutPuts = inferRouterOutputs<AppRouter>;
