/**
 * maps.tags (text[]) を正規化し tags / map_tags テーブルへ移行する。
 * スキーマから maps.tags カラムを削除する前に実行すること。
 * 冪等性あり：すでに移行済みのデータは重複しない。
 *
 * @example pnpm tags:normalize
 */
import { sql } from "drizzle-orm";
import { db } from "@/server/drizzle/client";
import { mapTags, tags } from "../schema";

const CHUNK_SIZE = 500;

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

async function columnExists(table: string, column: string): Promise<boolean> {
  const result = await db.execute<{ count: string }>(sql`
    SELECT COUNT(*) AS count
    FROM information_schema.columns
    WHERE table_name = ${table} AND column_name = ${column}
  `);
  return Number(result[0]?.count ?? 0) > 0;
}

async function main() {
  const hasTagsColumn = await columnExists("maps", "tags");
  if (!hasTagsColumn) {
    console.log("maps.tags カラムが存在しません。すでに移行済みか、カラムが削除済みです。");
    process.exit(0);
  }

  const rows = await db.execute<{ id: number; tags: string[] }>(sql`
    SELECT id, tags FROM maps
    WHERE tags IS NOT NULL AND array_length(tags, 1) > 0
  `);

  if (rows.length === 0) {
    console.log("タグを持つマップが存在しません。");
    process.exit(0);
  }

  console.log(`対象マップ数: ${rows.length}`);

  const allTagNames = [...new Set(rows.flatMap((row) => row.tags))];
  console.log(`ユニークタグ数: ${allTagNames.length}`);

  // tags テーブルへ CHUNK_SIZE 単位で挿入（既存タグはスキップ）
  for (const names of chunk(allTagNames, CHUNK_SIZE)) {
    await db
      .insert(tags)
      .values(names.map((name) => ({ name })))
      .onConflictDoNothing();
  }

  // 挿入済み含む全タグの id を一括取得（ANY を避けるため全件 SELECT）
  const existingTags = await db.select({ id: tags.id, name: tags.name }).from(tags);
  const tagNameToId = new Map(existingTags.map((t) => [t.name, t.id]));

  // map_tags へ挿入（既存エントリはスキップ）
  let insertedMapTags = 0;
  let skipped = 0;

  const allMapTagValues = rows.flatMap((row) =>
    row.tags.flatMap((name) => {
      const tagId = tagNameToId.get(name);
      return tagId !== undefined ? [{ mapId: row.id, tagId }] : [];
    }),
  );

  for (const values of chunk(allMapTagValues, CHUNK_SIZE)) {
    const result = await db.insert(mapTags).values(values).onConflictDoNothing().returning();
    insertedMapTags += result.length;
    skipped += values.length - result.length;
  }

  // mapCount を全タグ一括更新
  await db.execute(sql`
    UPDATE tags SET map_count = (
      SELECT COUNT(*) FROM map_tags mt
      JOIN maps m ON m.id = mt.map_id AND m.visibility = 'PUBLIC'
      WHERE mt.tag_id = tags.id
    )
  `);

  console.log("\n完了:");
  console.log(`  tags 挿入: ${existingTags.length} 件`);
  console.log(`  map_tags 挿入: ${insertedMapTags} 件`);
  if (skipped > 0) console.log(`  map_tags スキップ (既存): ${skipped} 件`);
  console.log("\nmaps.tags カラムの削除は pnpm db:generate && pnpm db:push で行ってください。");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
