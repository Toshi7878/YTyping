import { createClient } from "@supabase/supabase-js";
import { env } from "@/env";

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;

const isLocalSupabase = supabaseUrl.includes("localhost") || supabaseUrl.includes("127.0.0.1");

if (!isLocalSupabase) {
  throw new Error(
    "This seed script can only be run in local development environment with local Supabase. " +
      "Current Supabase URL: " +
      env.NEXT_PUBLIC_SUPABASE_URL +
      ". " +
      "Expected: localhost or 127.0.0.1. " +
      "Do not run this on production or remote Supabase environments.",
  );
}

const serviceRoleKey = env.SUPABASE_SECRET_KEY;
if (!serviceRoleKey) {
  throw new Error(
    "SUPABASE_SECRET_KEY is required for seeding. " +
      "Please set it in your .env file. " +
      "You can find the service_role key in 'pnpm db:status' output.",
  );
}

console.log("🔧 Running seed script with local Supabase:", supabaseUrl);

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
