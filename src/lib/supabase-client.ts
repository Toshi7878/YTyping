import { createClient } from "@supabase/supabase-js";
import { ENV } from "varlock/env";

const supabase = createClient(ENV.NEXT_PUBLIC_SUPABASE_URL, ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const createPresenceChannel = (channelName: string, userId: number) => {
  return supabase.channel(channelName, {
    config: { presence: { key: String(userId) } },
  });
};
