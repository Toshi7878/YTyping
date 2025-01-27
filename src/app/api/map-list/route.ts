import { auth } from "@/server/auth";
import { prisma } from "@/server/db";

import { NextRequest } from "next/server";

const MAP_LIST_TAKE_LENGTH = 40; //ここを編集したらInfiniteQueryのgetNextPageParamも編集する

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const session = await auth();
  const userId = Number(session?.user?.id);

  const page = searchParams.get("page") ?? "0";
  const mapKeyword = searchParams.get("mapKeyword") ?? "";
  const offset = MAP_LIST_TAKE_LENGTH * Number(page); // 20件ずつ読み込むように変更
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
    COALESCE(
      (
        SELECT json_agg(
          json_build_object(
            'is_liked', ml."is_liked",
            'user_id', ml."user_id"
          )
        )
        FROM map_likes ml
        WHERE ml."map_id" = maps."id"
        AND ml."user_id" = ${userId}
        GROUP BY ml."map_id"
      ),
      '[]'::json
    ) as map_likes,
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
    WHERE (
      ${mapKeyword} = '' OR (
        maps."title" &@~ ${mapKeyword} OR
        maps."artist_name" &@~ ${mapKeyword} OR
        maps."music_source" &@~ ${mapKeyword} OR
        maps."tags" &@~ ${mapKeyword} OR
        creator."name" &@~ ${mapKeyword}
      )
    )
    ORDER BY maps."id" DESC
    LIMIT ${MAP_LIST_TAKE_LENGTH} OFFSET ${offset}`;

    return new Response(JSON.stringify(mapList), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching map list:", error);

    return new Response("Internal Server Error", { status: 500 });
  }
}
