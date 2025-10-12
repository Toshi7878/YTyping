/** biome-ignore-all lint/style/noProcessEnv: ランタイムでの環境変数露出とツリーシェイク防止のため process.env が必要 */
import { createEnv } from "@t3-oss/env-nextjs";
import { vercel } from "@t3-oss/env-nextjs/presets-zod";
import { z } from "zod/v4";

export const env = createEnv({
  extends: [vercel()],

  shared: {
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.string().optional(),
  },
  /**
   * Specify your server-side environment variables schema here.
   * This way you can ensure the app isn't built with invalid env vars.
   */
  server: {
    AUTH_GOOGLE_ID: process.env.VERCEL ? z.string().min(1) : z.string().optional(),
    AUTH_GOOGLE_SECRET: process.env.VERCEL ? z.string().min(1) : z.string().optional(),
    AUTH_DISCORD_ID: process.env.VERCEL ? z.string().min(1) : z.string().optional(),
    AUTH_DISCORD_SECRET: process.env.VERCEL ? z.string().min(1) : z.string().optional(),
    AUTH_SECRET: process.env.VERCEL ? z.string().min(1) : z.string().optional().default("auth-secret"),

    GCP_AUTH_KEY: z.string().min(1),

    YAHOO_APP_ID: z.string().min(1).optional(),
    SUDACHI_API_KEY: z.string().min(1).optional(),
    SUDACHI_API_URL: z.string().min(1).optional(),
    NODE_ENV: z.enum(["development", "production"]).optional(),
    NEXT_RUNTIME: z.enum(["nodejs", "edge"]).optional(),
    DATABASE_URL: z.string().min(1),
    SUPABASE_SECRET_KEY: z.string().optional(),
    VERCEL_PROJECT_ID: process.env.VERCEL ? z.string().min(1) : z.string().optional(),
    VERCEL_API_TOKEN: process.env.VERCEL ? z.string().min(1) : z.string().optional(),
    R2_ACCOUNT_ID: process.env.VERCEL ? z.string().min(1) : z.string().optional(),
    R2_ACCESS_KEY_ID: process.env.VERCEL ? z.string().min(1) : z.string().optional(),
    R2_SECRET_ACCESS_KEY: process.env.VERCEL ? z.string().min(1) : z.string().optional(),
    R2_BUCKET_NAME: process.env.VERCEL ? z.string().min(1) : z.string().optional(),
  },

  /**
   * Specify your client-side environment variables schema here.
   * For them to be exposed to the client, prefix them with `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_MAINTENANCE_MODE: z.enum(["true", "false"]).optional().default("false"),
    NEXT_PUBLIC_SUPABASE_URL: z.string().min(1),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  },
  /**
   * Destructure all variables from `process.env` to make sure they aren't tree-shaken away.
   */
  experimental__runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_MAINTENANCE_MODE: process.env.NEXT_PUBLIC_MAINTENANCE_MODE,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    PORT: process.env.PORT,
  },

  skipValidation: !!process.env.CI || process.env.npm_lifecycle_event === "lint",
});
