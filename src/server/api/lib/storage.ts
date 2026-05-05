import { env } from "@/env";
import { downloadPublicFromR2, upsertPublicToR2 } from "@/server/api/lib/r2-storage";
import { downloadPublicFromSupabase, upsertPublicToSupabase } from "./supabase";

type ContentType = "application/gzip" | "application/json";

export interface FileUploadParams {
  key: string;
  body: Buffer | Uint8Array | string;
  contentType?: ContentType;
}

export const uploadPublicFile = async (params: FileUploadParams): Promise<void> => {
  if (env.VERCEL_ENV === "production") {
    return upsertPublicToR2(params);
  }

  return upsertPublicToSupabase(params);
};

export const downloadPublicFile = async (key: string): Promise<Uint8Array | undefined> => {
  if (env.R2_ACCOUNT_ID) {
    return downloadPublicFromR2({ key });
  }

  return downloadPublicFromSupabase({ key });
};
