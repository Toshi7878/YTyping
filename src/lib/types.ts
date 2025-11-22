import type { BuiltMapLine } from "lyrics-typing-engine";
import type z from "zod/v4";
import type { LineOptionSchema } from "@/validator/map-json";

type ContentType = "application/json";

export interface FileUploadParams {
  key: string;
  body: Buffer | Uint8Array | string;
  contentType?: ContentType;
}

export type BuiltMapLineWithOption = BuiltMapLine<z.infer<typeof LineOptionSchema>>;
