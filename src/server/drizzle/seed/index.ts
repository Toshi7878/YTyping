import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { parse } from "csv-parse/sync";
import { env } from "@/env";
import { db } from "../client";
import { SUPABASE_PUBLIC_BUCKET } from "../const";
import { MapDifficulties, Maps, Users } from "../schema";

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;

const isLocalSupabase = supabaseUrl.includes("localhost") || supabaseUrl.includes("127.0.0.1");

if (!isLocalSupabase) {
  throw new Error(
    "This seed script can only be run in local development environment with local Supabase. " +
      "Current Supabase URL: " +
      env.NEXT_PUBLIC_SUPABASE_URL +
      ". " +
      "Expected: localhost or 127.0.0.1. " +
      "Do not run this on production or remote Supabase environments.",
  );
}

const serviceRoleKey = env.SUPABASE_SECRET_KEY;
if (!serviceRoleKey) {
  throw new Error(
    // 開発環境ではSentryを無効化（localhost含む）
    "SUPABASE_SECRET_KEY is required for seeding. " +
      "Please set it in your .env file. " +
      "You can find the service_role key in 'pnpm db:status' output.",
  );
}

console.log("🔧 Running seed script with local Supabase:", supabaseUrl);

const supabase = createClient(supabaseUrl, serviceRoleKey);

// CSV パーサー
function parseCSV(csvText: string): Record<string, string>[] {
  return parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
}

function parseUserRow(row: Record<string, string>) {
  return {
    id: Number(row.id),
    name: row.name === "" ? null : row.name,
    emailHash: row.email_hash,
    role: row.role as "USER" | "ADMIN",
    createdAt: new Date(row.created_at.replace(" ", "T")),
    updatedAt: new Date(row.updated_at.replace(" ", "T")),
  };
}

function parseMapRow(row: Record<string, string>) {
  return {
    id: Number(row.id),
    videoId: row.video_id,
    title: row.title,
    artistName: row.artist_name,
    musicSource: row.music_source,
    creatorComment: row.creator_comment,
    tags: JSON.parse(row.tags),
    creatorId: Number(row.creator_id),
    previewTime: Number(row.preview_time),
    duration: Number(row.duration),
    playCount: Number(row.play_count),
    likeCount: Number(row.like_count),
    rankingCount: Number(row.ranking_count),
    category: JSON.parse(row.category),
    thumbnailQuality: row.thumbnail_quality as "mqdefault" | "maxresdefault",
    createdAt: new Date(row.created_at.replace(" ", "T")),
    updatedAt: new Date(row.updated_at.replace(" ", "T")),
  };
}

function parseMapDifficultyRow(row: Record<string, string>) {
  return {
    mapId: Number(row.map_id),
    romaKpmMedian: Number(row.roma_kpm_median),
    romaKpmMax: Number(row.roma_kpm_max),
    kanaKpmMedian: Number(row.kana_kpm_median),
    kanaKpmMax: Number(row.kana_kpm_max),
    romaTotalNotes: Number(row.roma_total_notes),
    kanaTotalNotes: Number(row.kana_total_notes),
    englishTotalNotes: Number(row.english_total_notes),
    symbolTotalNotes: Number(row.symbol_total_notes),
    intTotalNotes: Number(row.int_total_notes),
  };
}

async function main() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const tableDir = join(__dirname, "table");
  const mapJsonDir = join(__dirname, "map-json");

  console.log("\n📦 Creating Supabase Storage bucket...");
  const { error: bucketError } = await supabase.storage.createBucket(SUPABASE_PUBLIC_BUCKET, {
    public: true,
  });

  if (bucketError && !bucketError.message.includes("already exists")) {
    console.error("❌ Failed to create bucket:", bucketError);
    throw bucketError;
  }
  console.log("✅ Bucket ready:", SUPABASE_PUBLIC_BUCKET);

  // 2. Users テーブルにシードデータを挿入
  console.log("\n👥 Seeding users table...");
  const usersCSV = await readFile(join(tableDir, "users_rows.csv"), "utf-8");
  const userRows = parseCSV(usersCSV).map(parseUserRow);

  await db.insert(Users).values(userRows);
  console.log(`✅ Inserted ${userRows.length} users`);

  // 3. Maps テーブルにシードデータを挿入
  console.log("\n🗺️  Seeding maps table...");
  const mapsCSV = await readFile(join(tableDir, "maps_rows.csv"), "utf-8");
  const mapRows = parseCSV(mapsCSV).map(parseMapRow);

  await db.insert(Maps).values(mapRows);
  console.log(`✅ Inserted ${mapRows.length} maps`);

  // 4. MapDifficulties テーブルにシードデータを挿入
  console.log("\n📊 Seeding map_difficulties table...");
  const difficultiesCSV = await readFile(join(tableDir, "map_difficulties_rows.csv"), "utf-8");
  const difficultyRows = parseCSV(difficultiesCSV).map(parseMapDifficultyRow);

  await db.insert(MapDifficulties).values(difficultyRows);
  console.log(`✅ Inserted ${difficultyRows.length} map difficulties`);

  // 5. map-json ファイルを Supabase Storage にアップロード
  console.log("\n📤 Uploading map JSON files to Storage...");
  const jsonFiles = await readdir(mapJsonDir);
  let uploadCount = 0;

  for (const filename of jsonFiles) {
    if (!filename.endsWith(".json")) continue;

    const filePath = join(mapJsonDir, filename);
    const fileContent = await readFile(filePath, "utf-8");
    const storagePath = `map-json/${filename}`;

    const { error: uploadError } = await supabase.storage
      .from(SUPABASE_PUBLIC_BUCKET)
      .upload(storagePath, fileContent, {
        contentType: "application/json",
        upsert: true,
      });

    if (uploadError) {
      console.error(`❌ Failed to upload ${filename}:`, uploadError);
    } else {
      uploadCount++;
      console.log(`  ✅ Uploaded: ${storagePath}`);
    }
  }

  console.log(`\n✅ Uploaded ${uploadCount}/${jsonFiles.length} JSON files`);
  console.log("\n🎉 Seed completed successfully!");
}

main().catch((error) => {
  console.error("\n❌ Seed failed:", error);
  process.exit(1);
});
