import authConfig from "@/config/auth.config";
import { $Enums } from "@prisma/client";
import CryptoJS from "crypto-js";
import NextAuth from "next-auth";
import { prisma } from "./db";

// export const runtime = "edge";
export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account, profile }) {
      const hash = CryptoJS.MD5(user.email!).toString();
      const UserData = await prisma.user.findUnique({
        where: { email_hash: hash },
      });

      if (!UserData) {
        try {
          await prisma.user.create({
            data: {
              email_hash: hash!,
              name: null,
              role: "USER",
            },
          });
        } catch (err) {
          console.error("Error generating identicon:", err);
          return false;
        }
      }

      return true;
    },
    authorized({ request: { nextUrl }, auth }) {
      try {
        const isLoggedIn = !!auth?.user;
        const pathname = nextUrl.pathname;

        if (isLoggedIn) {
          const userName = auth.user.name;
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
      } catch (err) {}
    },
    async jwt({ token, trigger, session, user }) {
      if (trigger === "update") {
        token.name = session.name;
      }
      if (user) {
        const hash = CryptoJS.MD5(user.email!).toString();
        const dbUser = await prisma.user.findUnique({
          where: { email_hash: hash },
        });
        if (dbUser) {
          token.uid = dbUser.id.toString();
          token.email_hash = dbUser.email_hash;
        }

        token.name = dbUser?.name ?? null;
        token.role = dbUser?.role ?? "USER";
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.uid as string;
        session.user.name = token.name;
        session.user.email = token.email_hash as string;
        session.user.role = token.role as $Enums.Role;
      }
      return session;
    },
  },
});

const authRoutes = ["/user/register", "/user/settings"];
