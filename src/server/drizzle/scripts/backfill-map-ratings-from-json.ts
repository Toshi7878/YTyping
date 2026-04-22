/**
 * リポジトリ直下の `map-json/{mapId}.json` を読み、`map_difficulties.rating` を再計算して更新する。
 * `maps.updated_at` は変更しない。
 *
 * @example pnpm map:rating:backfill
 */
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { eq } from "drizzle-orm";
import { buildTypingMap } from "lyrics-typing-engine";
import z from "zod";
import { calcStarRating } from "@/server/api/routers/map/rating";
import { db } from "@/server/drizzle/client";
import { MapDifficulties } from "@/server/drizzle/schema";
import { RawMapLineSchema } from "@/validator/map/raw-map-json";

const rawMapLinesSchema = z.array(RawMapLineSchema);

const MAP_JSON_DIR = join(process.cwd(), "map-json");
const JSON_NAME_RE = /^(\d+)\.json$/;

async function main() {
  let filenames: string[];
  try {
    filenames = await readdir(MAP_JSON_DIR);
  } catch (e) {
    console.error(`map-json を読み取れません: ${MAP_JSON_DIR}`, e);
    process.exit(1);
  }

  const jsonFiles = filenames
    .filter((name) => JSON_NAME_RE.test(name))
    .sort((a, b) => {
      const na = Number(a.match(JSON_NAME_RE)?.[1] ?? 0);
      const nb = Number(b.match(JSON_NAME_RE)?.[1] ?? 0);
      return na - nb;
    });

  if (jsonFiles.length === 0) {
    console.warn(`対象ファイルがありません（${MAP_JSON_DIR} に {数字}.json を配置してください）`);
    process.exit(0);
  }

  let updated = 0;
  let skippedNoRow = 0;
  let failed = 0;

  for (const name of jsonFiles) {
    const mapId = Number(name.match(JSON_NAME_RE)?.[1]);
    const filePath = join(MAP_JSON_DIR, name);

    try {
      const text = await readFile(filePath, "utf-8");
      const parsed = JSON.parse(text) as unknown;
      const rawMapLines = rawMapLinesSchema.parse(parsed);
      const builtMapLines = buildTypingMap({ rawMapLines, charPoint: 0 });
      const rating = calcStarRating(builtMapLines);

      const rows = await db
        .update(MapDifficulties)
        .set({ rating })
        .where(eq(MapDifficulties.mapId, mapId))
        .returning({ mapId: MapDifficulties.mapId });

      if (rows.length === 0) {
        console.warn(`skip mapId=${mapId}: map_difficulties に行がありません`);
        skippedNoRow++;
        continue;
      }

      console.log(`ok mapId=${mapId} rating=${rating}`);
      updated++;
    } catch (e) {
      console.error(`fail mapId=${mapId} (${filePath}):`, e);
      failed++;
    }
  }

  console.log(`\n完了: 更新 ${updated} / DBに行なし ${skippedNoRow} / 失敗 ${failed}`);
  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
