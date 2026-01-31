/** biome-ignore-all lint/style/noProcessEnv: ランタイムでの環境変数露出とツリーシェイク防止のため process.env が必要 */
import { createEnv } from "@t3-oss/env-nextjs";
import { vercel } from "@t3-oss/env-nextjs/presets-zod";
import { z } from "zod/v4";

const isVercel = Boolean(process.env.VERCEL);

export const env = createEnv({
  extends: [vercel()],

  shared: {
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  },
  /**
   * Specify your server-side environment variables schema here.
   * This way you can ensure the app isn't built with invalid env vars.
   */
  server: {
    PORT: z.string().optional(),
    NODE_ENV: z.enum(["development", "production"]).optional(),
    NEXT_RUNTIME: z.enum(["nodejs", "edge"]).optional(),
    DATABASE_URL: z.url(),

    R2_ACCOUNT_ID: isVercel ? z.string() : z.string().optional(),
    R2_ACCESS_KEY_ID: isVercel ? z.string() : z.string().optional(),
    R2_SECRET_ACCESS_KEY: isVercel ? z.string() : z.string().optional(),
    R2_BUCKET_NAME: isVercel ? z.string() : z.string().optional(),

    AUTH_GOOGLE_ID: isVercel ? z.string() : z.string().optional(),
    AUTH_GOOGLE_SECRET: isVercel ? z.string() : z.string().optional(),
    AUTH_DISCORD_ID: isVercel ? z.string() : z.string().optional(),
    AUTH_DISCORD_SECRET: isVercel ? z.string() : z.string().optional(),
    AUTH_SECRET: isVercel ? z.string() : z.string().optional().default("auth-secret"),

    GCP_AUTH_KEY: isVercel ? z.string() : z.string().optional(),
    VERCEL_PROJECT_ID: isVercel ? z.string() : z.string().optional(),
    VERCEL_API_TOKEN: isVercel ? z.string() : z.string().optional(),
    SUDACHI_API_KEY: isVercel ? z.string() : z.string().optional(),
    SUDACHI_API_URL: isVercel ? z.url() : z.url().optional(),

    // 開発環境用
    YAHOO_APP_ID: isVercel ? z.undefined() : z.string().optional(),
    SUPABASE_SECRET_KEY: isVercel ? z.undefined() : z.string().optional(),
  },

  /**
   * Specify your client-side environment variables schema here.
   * For them to be exposed to the client, prefix them with `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_MAINTENANCE_MODE: z.enum(["true", "false"]).optional().default("false"),
    NEXT_PUBLIC_SUPABASE_URL: z.string(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  },
  /**
   * Destructure all variables from `process.env` to make sure they aren't tree-shaken away.
   */
  experimental__runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_MAINTENANCE_MODE: process.env.NEXT_PUBLIC_MAINTENANCE_MODE,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  skipValidation: !!process.env.CI || process.env.npm_lifecycle_event === "lint",
});
