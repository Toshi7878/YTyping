import { PAGE_SIZE, PARAM_NAME } from "@/app/(home)/ts/consts";
import { prisma } from "@/server/db";
import { Prisma } from "@prisma/client";
import { NextRequest } from "next/server";
import { generateMapListWhere } from "./where";

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
      }
    );
  } catch (error) {
    console.error("マップリスト取得エラー:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

interface GetSortSql {
  sort: string | null;
}
function getSortSql({ sort }: GetSortSql) {
  if (!sort) {
    return Prisma.raw(`maps."id" DESC`);
  }

  const isAsc = sort.includes("asc");

  switch (true) {
    case sort.includes("random"):
      return Prisma.raw(`RANDOM()`);
    case sort.includes("id"):
      if (isAsc) {
        return Prisma.raw(`maps."id" ASC`);
      } else {
        return Prisma.raw(`maps."id" DESC`);
      }
    case sort.includes("difficulty"):
      if (isAsc) {
        return Prisma.raw(`"difficulty"."roma_kpm_median" ASC`);
      } else {
        return Prisma.raw(`"difficulty"."roma_kpm_median" DESC`);
      }
    case sort.includes("ranking_count"):
      if (isAsc) {
        return Prisma.raw(`maps."ranking_count" ASC`);
      } else {
        return Prisma.raw(`maps."ranking_count" DESC`);
      }
    case sort.includes("like_count"):
      if (isAsc) {
        return Prisma.raw(`maps."like_count" ASC`);
      } else {
        return Prisma.raw(`maps."like_count" DESC`);
      }
    case sort.includes("duration"):
      if (isAsc) {
        return Prisma.raw(`"difficulty"."total_time" ASC`);
      } else {
        return Prisma.raw(`"difficulty"."total_time" DESC`);
      }
    case sort.includes("like"):
      if (isAsc) {
        return Prisma.raw(`"map_likes"."created_at" ASC`);
      } else {
        return Prisma.raw(`"map_likes"."created_at" DESC`);
      }
    default:
      return Prisma.raw(`maps."id" DESC`);
  }
}
