export type ContentType = "application/json";

export interface FileUploadParams {
  key: string;
  body: Buffer | Uint8Array | string;
  contentType?: ContentType;
}

export type NonEmptyArray<T> = [T, ...T[]] | [...T[], T];
