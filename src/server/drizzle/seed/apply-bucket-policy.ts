import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { sql as rawSql } from "drizzle-orm";
import { db } from "../client";
import { SUPABASE_PUBLIC_BUCKET } from "../const";
import { supabaseAdmin } from "./supabase-admin";

export async function seedBucketPolicy(sqlDir: string) {
  console.log("\n📦 Creating Supabase Storage bucket...");
  await supabaseAdmin.storage.createBucket(SUPABASE_PUBLIC_BUCKET, {
    public: true,
  });

  const policyFilePath = join(sqlDir, "apply-bucket-policy.sql");
  const policySql = await readFile(policyFilePath, "utf-8");
  const cleanedSql = policySql.replace(/public-bucket-name/g, SUPABASE_PUBLIC_BUCKET);
  await db.execute(rawSql.raw(cleanedSql));

  console.log("✅ Bucket policy applied");
}
