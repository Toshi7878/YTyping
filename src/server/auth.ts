import { PrismaClient } from "@prisma/client";
import CryptoJS from "crypto-js";
import NextAuth, { NextAuthConfig } from "next-auth";
import Discord from "next-auth/providers/discord";
import Google from "next-auth/providers/google";

// export const runtime = "edge";

const prisma = new PrismaClient();

export const config: NextAuthConfig = {
  providers: [Discord, Google],
  secret: process.env.AUTH_SECRET,
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
              role: "user",
            },
          });
        } catch (err) {
          console.error("Error generating identicon:", err);
          return false;
        }
      }

      return true;
    },
    authorized({ request, auth }) {
      try {
        const url = new URL(request.url);
        const pathname = url.pathname;
        if (pathname === "/user/register") {
          if (!auth?.user?.name) {
            return !!auth;
          } else {
            return false;
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
        token.role = dbUser?.role ?? "user";
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.uid as string;
        session.user.name = token.name;
        session.user.email = token.email_hash as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    // redirect({ url, baseUrl }) {
    //   // Allows relative callback URLs
    //   if (url.startsWith("/")) return `${baseUrl}${url}`;
    //   // Allows callback URLs on the same origin
    //   if (new URL(url).origin === baseUrl) return url;
    //   return baseUrl;
    // },
  },
  pages: {
    signIn: "/",
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
