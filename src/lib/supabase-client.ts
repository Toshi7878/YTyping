import { createClient } from "@supabase/supabase-js";
import { env } from "@/env";
import type { FileUploadParams } from "./types";

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase credentials are not configured");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const SUPABASE_BUCKET = "ytyping-public";

export const upsertPublicToSupabase = async ({
  key,
  body,
  contentType = "application/json",
}: FileUploadParams): Promise<void> => {
  const { error } = await supabase.storage.from(SUPABASE_BUCKET).upload(key, body, {
    contentType,
    upsert: true,
  });

  if (error) {
    console.error("Error uploading to Supabase Storage:", error);
    throw new Error(`Supabase upload failed: ${error.message}`);
  }
};

export const downloadPublicFromSupabase = async ({ key }: { key: string }): Promise<Uint8Array | undefined> => {
  const { data, error } = await supabase.storage.from(SUPABASE_BUCKET).download(key);

  if (error) {
    console.error("Error downloading from Supabase Storage:", error);
    throw new Error(`Supabase download failed: ${error.message}`);
  }

  if (data) {
    return new Uint8Array(await data.arrayBuffer());
  }

  return undefined;
};

export const createPresenceChannel = (channelName: string, userId: string) => {
  return supabase.channel(channelName, {
    config: { presence: { key: userId } },
  });
};
