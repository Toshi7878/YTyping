type ContentType = "application/gzip" | "application/json";

export interface FileUploadParams {
  key: string;
  body: Buffer | Uint8Array | string;
  contentType?: ContentType;
}
