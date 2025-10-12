import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Discord from "next-auth/providers/discord";
import Google from "next-auth/providers/google";
import { env } from "@/env";

// biome-ignore lint/style/noDefaultExport: <export default する必要がある>
export default {
  providers: [
    Discord,
    Google,
    ...(env.NODE_ENV === "development"
      ? [
          CredentialsProvider({
            id: "dev-admin",
            name: "Dev Admin",
            credentials: {},
            authorize: () => ({ email: "admin@dev.local" }),
          }),
          CredentialsProvider({
            id: "dev-user",
            name: "Dev User",
            credentials: {},
            authorize: () => ({ email: "user@dev.local" }),
          }),
        ]
      : []),
  ],
} satisfies NextAuthConfig;
