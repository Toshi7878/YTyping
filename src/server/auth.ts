import authConfig from "@/config/auth.config";
import { env } from "@/env";
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
// Avoid importing Node-only DB client at module scope; load dynamically in Node runtime callbacks

export const { auth, handlers, signIn } = NextAuth({
  ...authConfig,
  secret: env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    error: "/",
    newUser: "/user/register",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user?.email) return false;

      const md5 = (await import("md5")).default;
      const email_hash = md5(user.email).toString();
      const { db: drizzleDb, schema } = await import("./drizzle/client");
      const existed = await drizzleDb
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(eq(schema.users.emailHash, email_hash))
        .limit(1);
      if (existed.length > 0) return true;

      await drizzleDb.insert(schema.users).values({
        emailHash: email_hash,
        name: null,
        role: "USER",
      });
      return true;
    },

    authorized({ request: { nextUrl }, auth }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      if (isLoggedIn) {
        const userName = auth.user.name;

        const isMaintenanceMode = env.NEXT_PUBLIC_MAINTENANCE_MODE !== "false";

        if (isMaintenanceMode) {
          if (pathname !== "/maintenance") {
            return Response.redirect(new URL("/maintenance", nextUrl));
          }
        } else {
          if (pathname === "/maintenance") {
            return Response.redirect(new URL("/404", nextUrl));
          }
        }

        if (userName) {
          if (pathname === "/user/register") {
            return Response.redirect(new URL("/", nextUrl));
          }
        } else {
          if (pathname !== "/user/register") {
            return Response.redirect(new URL("/user/register", nextUrl));
          }
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
      if (!user || !user?.email) return token;

      const md5 = (await import("md5")).default;
      const email_hash = md5(user.email).toString();
      const { db: drizzleDb, schema } = await import("./drizzle/client");
      const rows = await drizzleDb
        .select({ id: schema.users.id, name: schema.users.name, role: schema.users.role })
        .from(schema.users)
        .where(eq(schema.users.emailHash, email_hash))
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

const authRoutes = ["/user/register", "/user/settings", "/user/mypage"];
