import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { Prisma } from "@prisma/client";
import { NextRequest } from "next/server";

const MAP_LIST_TAKE_LENGTH = 40; //ここを編集したらInfiniteQueryのgetNextPageParamも編集する

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const session = await auth();
  const userId = Number(session?.user?.id);

  const page = searchParams.get("page") ?? "0";
  const mapKeyword = searchParams.get("keyword") ?? "";
  const filterSql = getFilterSql({ filter: searchParams.get("filter"), userId });
  const sortSql = getSortSql({ sort: searchParams.get("sort") });
  const minRate = searchParams.get("minRate");
  const maxRate = searchParams.get("maxRate");
  const difficultyFilterSql = getDifficultyFilterSql({ minRate, maxRate });
  const playedSql = getPlayedFilterSql({ played: searchParams.get("played"), userId });

  const offset = MAP_LIST_TAKE_LENGTH * Number(page);

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
    WHERE (
      ${filterSql} AND
      ${difficultyFilterSql} AND
      ${playedSql} AND
      (${mapKeyword} = '' OR (
        maps."title" &@~ ${mapKeyword} OR
        maps."artist_name" &@~ ${mapKeyword} OR
        maps."music_source" &@~ ${mapKeyword} OR
        maps."tags" &@~ ${mapKeyword} OR
        creator."name" &@~ ${mapKeyword}
      ))
    )
    ${sortSql}
    LIMIT ${MAP_LIST_TAKE_LENGTH} OFFSET ${offset}`;

    return new Response(JSON.stringify(mapList), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching map list:", error);

    return new Response("Internal Server Error", { status: 500 });
  }
}

interface GetFilterSql {
  filter: string | null;
  userId: number;
}

function getFilterSql({ filter, userId }: GetFilterSql) {
  switch (filter) {
    case "liked":
      return Prisma.raw(`map_likes."is_liked" = true`);
    case "my-map":
      return Prisma.raw(`creator."id" = ${userId}`);
    default:
      return Prisma.raw("1=1");
  }
}

interface GetSortSql {
  sort: string | null;
}
function getSortSql({ sort }: GetSortSql) {
  if (!sort) {
    return Prisma.raw(`ORDER BY maps."id" DESC`);
  }

  const isAsc = sort.includes("asc");

  switch (true) {
    case sort.includes("random"):
      return Prisma.raw(`ORDER BY RANDOM()`);
    case sort.includes("id"):
      if (isAsc) {
        return Prisma.raw(`ORDER BY maps."id" ASC`);
      } else {
        return Prisma.raw(`ORDER BY maps."id" DESC`);
      }
    case sort.includes("difficulty"):
      if (isAsc) {
        return Prisma.raw(`ORDER BY "difficulty"."roma_kpm_median" ASC`);
      } else {
        return Prisma.raw(`ORDER BY "difficulty"."roma_kpm_median" DESC`);
      }
    case sort.includes("ranking_count"):
      if (isAsc) {
        return Prisma.raw(`ORDER BY maps."ranking_count" ASC`);
      } else {
        return Prisma.raw(`ORDER BY maps."ranking_count" DESC`);
      }
    case sort.includes("like_count"):
      if (isAsc) {
        return Prisma.raw(`ORDER BY maps."like_count" ASC`);
      } else {
        return Prisma.raw(`ORDER BY maps."like_count" DESC`);
      }
    case sort.includes("duration"):
      if (isAsc) {
        return Prisma.raw(`ORDER BY "difficulty"."total_time" ASC`);
      } else {
        return Prisma.raw(`ORDER BY "difficulty"."total_time" DESC`);
      }
    default:
      return Prisma.raw(`ORDER BY maps."id" DESC`);
  }
}

interface GetDifficultyFilterSql {
  minRate: string | null;
  maxRate: string | null;
}

function getDifficultyFilterSql({ minRate, maxRate }: GetDifficultyFilterSql) {
  const conditions: string[] = [];

  if (minRate && !isNaN(Number(minRate))) {
    conditions.push(`"difficulty"."roma_kpm_median" >= ${Number(minRate) * 100}`);
  }

  if (maxRate && !isNaN(Number(maxRate))) {
    conditions.push(`"difficulty"."roma_kpm_median" <= ${Number(maxRate) * 100}`);
  }

  return conditions.length > 0 ? Prisma.raw(conditions.join(" AND ")) : Prisma.raw("1=1");
}

interface GetPlayedFilterSql {
  played: string | null;
  userId: number;
}

function getPlayedFilterSql({ played, userId }: GetPlayedFilterSql) {
  switch (played) {
    case "played":
      return Prisma.raw(`EXISTS (
        SELECT 1 FROM results
        WHERE results.map_id = maps.id
        AND results.user_id = ${userId}
      )`);
    case "unplayed":
      return Prisma.raw(`NOT EXISTS (
        SELECT 1 FROM results
        WHERE results.map_id = maps.id
        AND results.user_id = ${userId}
      )`);
    case "1st":
      return Prisma.raw(`EXISTS (
        SELECT 1 FROM results
        WHERE results.map_id = maps.id
        AND results.user_id = ${userId}
        AND results.rank = 1
      )`);
    case "not-first":
      return Prisma.raw(`EXISTS (
        SELECT 1 FROM results
        WHERE results.map_id = maps.id
        AND results.user_id = ${userId}
        AND results.rank > 1
      )`);
    case "perfect":
      return Prisma.raw(`EXISTS (
        SELECT 1 FROM results
        JOIN result_statuses ON results.id = result_statuses.result_id
        WHERE results.map_id = maps.id
        AND results.user_id = ${userId}
        AND result_statuses.miss = 0
        AND result_statuses.lost = 0
      )`);
    default:
      return Prisma.raw("1=1");
  }
}
