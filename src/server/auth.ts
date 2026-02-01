import { eq, max } from "drizzle-orm";
import md5 from "md5";
import type { DefaultSession } from "next-auth";
import NextAuth from "next-auth";
import authConfig from "@/config/auth.config";
import { env } from "@/env";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "USER" | "ADMIN";
      email_hash: string;
    } & DefaultSession["user"];
  }
}

export const { auth, handlers, signIn } = NextAuth({
  ...authConfig,
  secret: env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    error: "/",
    newUser: "/user/register",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user?.email) return false;

      const email_hash = md5(user.email).toString();
      const {
        db: drizzleDb,
        schema: { Users },
      } = await import("./drizzle/client");
      const existed = await drizzleDb
        .select({ id: Users.id })
        .from(Users)
        .where(eq(Users.emailHash, email_hash))
        .limit(1);
      if (existed.length > 0) return true;

      // 現在の最大 ID を取得してインクリメント
      const maxId = await drizzleDb
        .select({ maxId: max(Users.id) })
        .from(Users)
        .then((rows) => rows[0]?.maxId ?? 0);

      const nextId = maxId + 1;

      await drizzleDb.insert(Users).values({
        id: nextId,
        emailHash: email_hash,
        name: null,
        role: "USER",
      });
      return true;
    },

    authorized({ request: { nextUrl }, auth }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      if (isLoggedIn) {
        const userName = auth.user.name;

        const isMaintenanceMode = env.NEXT_PUBLIC_MAINTENANCE_MODE !== "false";

        if (isMaintenanceMode) {
          if (pathname !== "/maintenance") {
            return Response.redirect(new URL("/maintenance", nextUrl));
          }
        } else if (pathname === "/maintenance") {
          return Response.redirect(new URL("/404", nextUrl));
        }

        if (userName) {
          if (pathname === "/user/register") {
            return Response.redirect(new URL("/", nextUrl));
          }
        } else if (pathname !== "/user/register") {
          return Response.redirect(new URL("/user/register", nextUrl));
        }
      } else {
        const isAuthRoute = authRoutes.includes(pathname);

        if (isAuthRoute) {
          //ログアウト状態の場合は専用ページアクセス時にrootにリダイレクトさせる
          return Response.redirect(new URL("/", nextUrl));
        }
      }

      return true;
    },
    async jwt({ token, trigger, session, user }) {
      if (trigger === "update") {
        token.name = session.name as string;
      }
      if (!user?.email) return token;

      const email_hash = md5(user.email).toString();
      const {
        db,
        schema: { Users },
      } = await import("./drizzle/client");
      const rows = await db
        .select({ id: Users.id, name: Users.name, role: Users.role })
        .from(Users)
        .where(eq(Users.emailHash, email_hash))
        .limit(1);

      const dbUser = rows[0];
      if (dbUser) {
        token.uid = dbUser.id.toString();
        token.email_hash = email_hash;
        token.name = dbUser.name ?? null;
        token.role = dbUser.role ?? "USER";
      } else {
        token.role = "USER";
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.uid as string;
        session.user.name = token.name;
        session.user.email_hash = token.email_hash as string;
        session.user.role = token.role as "USER" | "ADMIN";
      }
      return session;
    },
  },
});

const authRoutes = ["/user/register", "/user/settings"];
