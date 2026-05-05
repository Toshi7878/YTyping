import { createClient } from "@supabase/supabase-js";
import { env } from "@/env";

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const createPresenceChannel = (channelName: string, userId: number) => {
  return supabase.channel(channelName, {
    config: { presence: { key: String(userId) } },
  });
};
