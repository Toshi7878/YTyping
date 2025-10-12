import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "@/env";
import type { FileUploadParams } from "./types";

const R2 =
  env.R2_ACCOUNT_ID && env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY && env.R2_BUCKET_NAME
    ? new S3Client({
        region: "auto",
        endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: env.R2_ACCESS_KEY_ID,
          secretAccessKey: env.R2_SECRET_ACCESS_KEY,
        },
      })
    : null;

export const upsertPublicToR2 = async ({ key, body, contentType }: FileUploadParams): Promise<void> => {
  if (!R2) {
    throw new Error("R2 is not configured. Please set R2 environment variables.");
  }

  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  await R2.send(command);
};

export const downloadPublicFromR2 = async ({ key }: { key: string }): Promise<Uint8Array | undefined> => {
  if (!R2) {
    throw new Error("R2 is not configured. Please set R2 environment variables.");
  }

  const command = new GetObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
  });

  try {
    const response = await R2.send(command);
    if (response.Body) {
      return new Uint8Array(await response.Body.transformToByteArray());
    }
  } catch (error) {
    console.error("Error downloading from R2:", error);
    throw error;
  }

  return undefined;
};
