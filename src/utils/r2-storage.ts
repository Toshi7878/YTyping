import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { env } from "@/env"

const R2 = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
})

export const upsertFile = async ({
  key,
  body,
  contentType = "application/json",
}: {
  key: string
  body: Buffer | Uint8Array | string
  contentType?: string
}): Promise<void> => {
  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
  })

  await R2.send(command)
}

export const downloadFile = async ({ key }: { key: string }): Promise<Uint8Array | undefined> => {
  const command = new GetObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
  })

  try {
    const response = await R2.send(command)
    if (response.Body) {
      return new Uint8Array(await response.Body.transformToByteArray())
    }
  } catch (error) {
    console.error("Error downloading from R2:", error)
    throw error
  }

  return undefined
}
