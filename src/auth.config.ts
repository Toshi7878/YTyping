import type { NextAuthConfig } from "next-auth";
import Discord from "next-auth/providers/discord";
import Google from "next-auth/providers/google";

export default { providers: [Discord, Google] } satisfies NextAuthConfig;
