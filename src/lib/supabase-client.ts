import { createClient } from "@supabase/supabase-js"
import { env } from "@/env"

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("")
}
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
