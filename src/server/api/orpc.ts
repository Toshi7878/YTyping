import "server-only";
import { ORPCError, os } from "@orpc/server";
import { type Auth, getSession } from "@/auth/server";
import { db } from "../drizzle/client";

export const createORPCContext = async (opts: { headers: Headers; auth: Auth }) => {
  const authApi = opts.auth.api;
  const session = await getSession();

  return { authApi, session, db, headers: opts.headers };
};

export type ORPCContext = Awaited<ReturnType<typeof createORPCContext>>;

export type ProtectedCtx = ORPCContext & { session: NonNullable<ORPCContext["session"]> };

const base = os.$context<ORPCContext>();

export const publicProcedure = base;

export const protectedProcedure = base.use(({ context, next }) => {
  if (!context.session) {
    throw new ORPCError("UNAUTHORIZED", { message: "認証が必要です" });
  }

  return next({ context: { session: context.session } });
});

export const adminProcedure = base.use(({ context, next }) => {
  if (context.session?.user.role !== "ADMIN") {
    throw new ORPCError("FORBIDDEN");
  }

  return next({ context: { session: context.session } });
});
