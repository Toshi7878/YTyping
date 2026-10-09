import { createClient } from "@supabase/supabase-js";
import { env } from "@/env";
import { SUPABASE_PUBLIC_BUCKET } from "@/server/drizzle/const";
import type { FileUploadParams } from "./storage";

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const upsertPublicToSupabase = async ({
  key,
  body,
  contentType = "application/json",
}: FileUploadParams): Promise<void> => {
  const { error } = await supabase.storage.from(SUPABASE_PUBLIC_BUCKET).upload(key, body, {
    contentType,
    upsert: true,
  });

  if (error) {
    console.error("Error uploading to Supabase Storage:", error);
    throw new Error(`Supabase upload failed: ${error.message}`);
  }
};

export const downloadPublicFromSupabase = async ({ key }: { key: string }): Promise<Uint8Array | undefined> => {
  const { data, error } = await supabase.storage.from(SUPABASE_PUBLIC_BUCKET).download(key);

  if (error) {
    console.error("Error downloading from Supabase Storage:", error);
    throw new Error(`Supabase download failed: ${error.message}`);
  }

  if (data) {
    return new Uint8Array(await data.arrayBuffer());
  }

  return undefined;
};
