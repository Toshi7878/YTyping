import { auth } from "@/server/auth";
import { PrismaClient } from "@prisma/client";

import { NextRequest } from "next/server";

const prisma = new PrismaClient();

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
    "Map"."id",
    "Map"."title",
    "Map"."artistName",
    "Map"."musicSource",
    "Map"."romaKpmMedian",
    "Map"."romaKpmMax",
    "Map"."videoId",
    "Map"."updatedAt",
    "Map"."previewTime",
    "Map"."totalTime",
    "Map"."thumbnailQuality",
    "Map"."likeCount",
    "Map"."rankingCount",
    json_build_object('id', "User"."id", 'name', "User"."name") as "user",
    'mapLike', COALESCE(
        (
          SELECT array_agg(json_build_object('isLiked', "isLiked"))
          FROM "MapLike"
          WHERE "MapLike"."mapId" = "Map"."id"
          AND "MapLike"."userId" = ${userId}
        ),
        ARRAY[]::json[]
      ) as "mapLike",
      'result', COALESCE(
        (
          SELECT array_agg(json_build_object('rank', "rank"))
          FROM "Result"
          WHERE "Result"."mapId" = "Map"."id"
          AND "Result"."userId" = ${userId}
        ),
        ARRAY[]::json[]
      ) as "result"
    FROM "Map"
    JOIN "User" ON "Map"."creatorId" = "User"."id"
    WHERE (
            CASE
              WHEN ${mapKeyword} != '' THEN "title" &@~ ${mapKeyword}
              OR "artistName" &@~ ${mapKeyword}
              OR "musicSource" &@~ ${mapKeyword}
              OR "tags" &@~ ${mapKeyword}
              OR "User"."name" &@~ ${mapKeyword}
              ELSE 1=1
              END
          )
    ORDER BY "Map"."id" DESC
    LIMIT ${MAP_LIST_TAKE_LENGTH} OFFSET ${offset}`;

    return new Response(JSON.stringify(mapList), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching map list:", error);

    return new Response("Internal Server Error", { status: 500 });
  }
}
