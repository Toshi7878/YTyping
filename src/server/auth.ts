import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import md5 from "md5";
import { headers } from "next/headers";
import { cache } from "react";
import { env } from "@/env";
import { db, schema } from "@/server/drizzle/client";
import type { Session } from "../lib/auth-client";
import "server-only";

const baseUrl =
  env.VERCEL_ENV === "production"
    ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
    : env.VERCEL_ENV === "preview"
      ? "https://ytyping-dev.vercel.app"
      : "http://localhost:3000";

export const auth = betterAuth({
  baseURL: baseUrl,
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    schema: {
      ...schema,
      users: schema.Users,
      sessions: schema.Sessions,
      accounts: schema.Accounts,
      verifications: schema.Verifications,
    },
  }),
  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({
          data: { ...user, name: undefined },
        }),
      },
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "discord"],
      allowDifferentEmails: false,
    },
  },

  advanced: {
    database: {
      generateId: false,
    },
  },
  user: {
    fields: { email: "emailHash" },
    additionalFields: {
      role: { type: "string", input: false },
    },
  },
  socialProviders: {
    discord: {
      clientId: env.AUTH_DISCORD_ID,
      clientSecret: env.AUTH_DISCORD_SECRET,
      mapProfileToUser: ({ email }) => {
        const emailHash = md5(email);
        return { email: emailHash, image: undefined, name: undefined };
      },
    },
    google: {
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
      mapProfileToUser: ({ email }) => {
        const emailHash = md5(email);
        return { email: emailHash, name: undefined, image: undefined };
      },
    },
  },
});

export const getSession = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const { email: _email, ...userWithoutEmail } = session.user;
  return {
    ...session,
    user: { ...userWithoutEmail, id: Number(session.user.id), role: session.user.role as Session["user"]["role"] },
  };
});

export type Auth = typeof auth;
