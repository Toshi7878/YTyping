import { PAGE_SIZE, PARAM_NAME } from "@/app/(home)/_lib/const";
import { prisma } from "@/server/db";
import { NextRequest } from "next/server";
import { generateMapListWhere, getSortSql } from "./where";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = Number(searchParams.get("userId"));

  const offset = PAGE_SIZE * (Number(searchParams.get("page")) ?? 0);
  const where = generateMapListWhere({ searchParams, userId });
  const orderBy = getSortSql({ sort: searchParams.get(PARAM_NAME.sort) });
  try {
    const mapList = await prisma.$queryRaw`
    SELECT
    maps."id",
    maps."video_id",
    maps."title",
    maps."artist_name",
    maps."preview_time",
    maps."like_count",
    maps."ranking_count",
    maps."updated_at",
    maps."thumbnail_quality",
    maps."music_source",
    json_build_object(
      'id', creator."id",
      'name', creator."name"
    ) as "creator",
    json_build_object(
      'roma_kpm_median', "difficulty"."roma_kpm_median",
      'roma_kpm_max', "difficulty"."roma_kpm_max",
      'total_time', "difficulty"."total_time"
    ) as "difficulty",
    EXISTS (
      SELECT 1
      FROM map_likes ml
      WHERE ml."map_id" = maps."id"
      AND ml."user_id" = ${userId}
      AND ml."is_liked" = true
    ) as is_liked,
    COALESCE(
      (
        SELECT json_agg(
          json_build_object(
            'rank', r."rank"
          )
        )
        FROM (
          SELECT MIN(rank) as rank
          FROM results
          WHERE "map_id" = maps."id"
          AND "user_id" = ${userId}
        ) r
      ),
      '[]'::json
    ) as results
    FROM maps
    JOIN users AS creator ON maps."creator_id" = creator."id"
    JOIN map_difficulties AS "difficulty" ON maps."id" = "difficulty"."map_id"
    LEFT JOIN map_likes ON maps."id" = map_likes."map_id" AND map_likes."user_id" = ${userId}
    WHERE (${where})
    ORDER BY ${orderBy}
    LIMIT ${PAGE_SIZE} OFFSET ${offset}`;

    return new Response(
      JSON.stringify({
        maps: mapList,
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("マップリスト取得エラー:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
