import type { NextAuthConfig } from "next-auth";
import Discord from "next-auth/providers/discord";
import Google from "next-auth/providers/google";

// biome-ignore lint/style/noDefaultExport: <export default する必要がある>
export default { providers: [Discord, Google] } satisfies NextAuthConfig;
