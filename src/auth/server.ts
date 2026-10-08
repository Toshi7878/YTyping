import { createHash } from "node:crypto";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { headers } from "next/headers";
import { cache } from "react";
import { ENV } from "varlock/env";
import { db } from "@/server/drizzle/client";
import * as schema from "../server/drizzle/schema";
import type { Session } from "./client";
import "server-only";

const baseUrl =
  ENV.VERCEL_ENV === "production"
    ? `https://${ENV.VERCEL_PROJECT_PRODUCTION_URL}`
    : ENV.VERCEL_ENV === "preview"
      ? "https://ytyping-dev.vercel.app"
      : "http://localhost:3000";

const createMd5Hash = (value: string) => createHash("md5").update(value).digest("hex");

export const auth = betterAuth({
  baseURL: baseUrl,
  secret: ENV.AUTH_SECRET,
  database: drizzleAdapter(db, { provider: "pg", usePlural: true, schema }),
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },
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
      banned: { type: "boolean", input: false },
      banReason: { type: "string", input: false, required: false },
      warningCount: { type: "number", input: false, defaultValue: 0 },
    },
  },
  socialProviders: {
    discord: {
      clientId: ENV.AUTH_DISCORD_ID,
      clientSecret: ENV.AUTH_DISCORD_SECRET,
      mapProfileToUser: ({ email }) => {
        if (!email) throw new Error("Discord account has no verified email");
        const emailHash = createMd5Hash(email);
        return { email: emailHash, image: undefined, name: undefined };
      },
    },
    google: {
      clientId: ENV.AUTH_GOOGLE_ID,
      clientSecret: ENV.AUTH_GOOGLE_SECRET,
      mapProfileToUser: ({ email }) => {
        const emailHash = createMd5Hash(email);
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
