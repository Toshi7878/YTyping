import { prisma } from "@/server/db";
import { NextRequest } from "next/server";

import {
  DEFAULT_CLEAR_RATE_SEARCH_RANGE,
  DEFAULT_KPM_SEARCH_RANGE,
  PAGE_SIZE,
  PARAM_NAME,
} from "@/app/timeline/_lib/consts";
import { FilterMode } from "@/app/timeline/_lib/type";
import { auth } from "@/server/auth";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await auth();
  const userId = Number(session?.user?.id);

  const { searchParams } = new URL(req.url);
  const page = searchParams.get("page") ?? "0";
  const offset = PAGE_SIZE * Number(page);

  const modeFilter = generateModeFilterSql({ mode: (searchParams.get(PARAM_NAME.mode) ?? "all") as FilterMode });

  const kpmFilter = generateKpmFilterSql({
    minKpm: Number(searchParams.get(PARAM_NAME.minKpm) ?? DEFAULT_KPM_SEARCH_RANGE.min),
    maxKpm: Number(searchParams.get(PARAM_NAME.maxKpm) ?? DEFAULT_KPM_SEARCH_RANGE.max),
  });

  const clearRateFilter = generateClearRateFilterSql({
    minClearRate: Number(searchParams.get(PARAM_NAME.minClearRate) ?? DEFAULT_CLEAR_RATE_SEARCH_RANGE.min),
    maxClearRate: Number(searchParams.get(PARAM_NAME.maxClearRate) ?? DEFAULT_CLEAR_RATE_SEARCH_RANGE.max),
  });

  const playSpeedFilter = generatePlaySpeedFilterSql({
    minPlaySpeed: Number(searchParams.get(PARAM_NAME.minPlaySpeed) ?? 1),
    maxPlaySpeed: Number(searchParams.get(PARAM_NAME.maxPlaySpeed) ?? 2),
  });

  const keywordFilter = generateKeywordFilterSql({
    username: searchParams.get(PARAM_NAME.username) ?? "",
    mapKeyword: searchParams.get(PARAM_NAME.mapkeyword) ?? "",
  });

  const whereConditions = [modeFilter, kpmFilter, clearRateFilter, playSpeedFilter, ...keywordFilter];

  const where = Prisma.sql`${Prisma.join(whereConditions, ` AND `)}`;

  try {
    const resultList = await prisma.$queryRaw`
      SELECT results."id",
      results."map_id",
      results."user_id",
      results."updated_at",
      results."clap_count",
      results."rank",
      json_build_object(
        'score', "status"."score",
        'miss', "status"."miss",
        'lost', "status"."lost",
        'roma_type', "status"."roma_type",
        'kana_type', "status"."kana_type",
        'flick_type', "status"."flick_type",
        'english_type', "status"."english_type",
        'num_type', "status"."num_type",
        'symbol_type', "status"."symbol_type",
        'space_type', "status"."space_type",
        'kpm', "status"."kpm",
        'roma_kpm', "status"."roma_kpm",
        'clear_rate', "status"."clear_rate",
        'default_speed', "status"."default_speed"
      ) as "status",
      json_build_object(
        'id', map."id",
        'video_id', map."video_id",
        'title', map."title",
        'artist_name', map."artist_name",
        'music_source', map."music_source",
        'preview_time', map."preview_time",
        'thumbnail_quality', map."thumbnail_quality",
        'like_count', map."like_count",
        'ranking_count', map."ranking_count",
        'updated_at', map."updated_at",
        'creator', json_build_object(
          'id', creator."id",
          'name', creator."name"
        ),
        'map_likes', COALESCE(
      (
        SELECT json_agg(
          json_build_object(
            'is_liked', ml."is_liked",
            'user_id', ml."user_id"
          )
        )
        FROM map_likes ml
        WHERE ml."map_id" = map."id"
        AND ml."user_id" = ${userId}
        GROUP BY ml."map_id"
      ),
      '[]'::json
    ),
    'results', COALESCE(
      (
        SELECT json_agg(
          json_build_object(
            'rank', r."rank"
          )
        )
        FROM (
          SELECT MIN(rank) as rank
          FROM results
          WHERE "map_id" = map."id"
          AND "user_id" = ${userId}
        ) r
      ),
      '[]'::json
    )
      ) as "map",
     (
         SELECT "is_claped"
         FROM result_claps
         WHERE result_claps."result_id" = results."id"
         AND result_claps."user_id" = ${userId}
         LIMIT 1
       ) as "hasClap",
      json_build_object(
        'id', "Player"."id",
        'name', "Player"."name"
      ) as "player"

      FROM results
      JOIN maps AS map ON results."map_id" = map."id"
      JOIN result_statuses AS "status" ON results."id" = "status"."result_id"
      JOIN users AS creator ON map."creator_id" = creator."id"
      JOIN users AS "Player" ON results."user_id" = "Player"."id"
      WHERE ${where}
      ORDER BY results."updated_at" DESC
      LIMIT ${PAGE_SIZE} OFFSET ${offset}
    `;

    return new Response(JSON.stringify(resultList), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
}

interface GenerateModeFilterSql {
  mode: string;
}

function generateModeFilterSql({ mode }: GenerateModeFilterSql) {
  if (mode === "all") return Prisma.raw("1=1");

  return Prisma.sql`(
    CASE
      WHEN ${mode} = 'roma' THEN "status"."roma_type" > 0 AND "status"."kana_type" = 0
      WHEN ${mode} = 'kana' THEN "status"."kana_type" > 0 AND "status"."roma_type" = 0
      WHEN ${mode} = 'romakana' THEN "status"."kana_type" > 0 AND "status"."roma_type" > 0
      WHEN ${mode} = 'english' THEN "status"."kana_type" = 0 AND "status"."roma_type" = 0 AND "status"."english_type" > 0
    END
  )`;
}

interface GenerateKpmFilterSql {
  minKpm: number;
  maxKpm: number;
}

function generateKpmFilterSql({ minKpm, maxKpm }: GenerateKpmFilterSql) {
  if (maxKpm === 0) return Prisma.raw("1=1");

  if (maxKpm === DEFAULT_KPM_SEARCH_RANGE.max) {
    return Prisma.sql`("status"."roma_kpm" >= ${minKpm})`;
  }

  return Prisma.sql`("status"."roma_kpm" BETWEEN ${minKpm} AND ${maxKpm})`;
}

interface GenerateClearRateFilterSql {
  minClearRate: number;
  maxClearRate: number;
}

function generateClearRateFilterSql({ minClearRate, maxClearRate }: GenerateClearRateFilterSql) {
  if (maxClearRate === 0) return Prisma.raw("1=1");

  return Prisma.sql`("status"."clear_rate" BETWEEN ${minClearRate} AND ${maxClearRate})`;
}

interface GeneratePlaySpeedFilterSql {
  minPlaySpeed: number;
  maxPlaySpeed: number;
}

function generatePlaySpeedFilterSql({ minPlaySpeed, maxPlaySpeed }: GeneratePlaySpeedFilterSql) {
  if (maxPlaySpeed === 0) return Prisma.raw("1=1");

  return Prisma.sql`("status"."default_speed" BETWEEN ${minPlaySpeed} AND ${maxPlaySpeed})`;
}

interface GenerateKeywordFilterSql {
  username: string;
  mapKeyword: string;
}

function generateKeywordFilterSql({ username, mapKeyword }: GenerateKeywordFilterSql) {
  const usernameCondition = username !== "" ? Prisma.sql`("Player"."name" &@~ ${username})` : Prisma.raw("1=1");

  const mapKeywordCondition =
    mapKeyword !== ""
      ? Prisma.sql`(
      map."title" &@~ ${mapKeyword} OR
      map."artist_name" &@~ ${mapKeyword} OR
      map."music_source" &@~ ${mapKeyword} OR
      map."tags" &@~ ${mapKeyword} OR
      creator."name" &@~ ${mapKeyword}
      )`
      : Prisma.raw("1=1");

  return [usernameCondition, mapKeywordCondition];
}
