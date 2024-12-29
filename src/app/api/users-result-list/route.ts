import { prisma } from "@/server/db";
import { NextRequest } from "next/server";

import {
  DEFAULT_CLEAR_RATE_SEARCH_RANGE,
  DEFAULT_KPM_SEARCH_RANGE,
} from "@/app/timeline/ts/const/consts";
import { FilterMode } from "@/app/timeline/ts/type";
import { auth } from "@/server/auth";

const USERS_RESULT_LIST_TAKE_LENGTH = 30; //ここを編集したらInfiniteQueryのgetNextPageParamも編集する

export async function GET(req: NextRequest) {
  const session = await auth();
  const userId = Number(session?.user?.id);

  const { searchParams } = new URL(req.url);
  const page = searchParams.get("page") ?? "0";
  const mode = (searchParams.get("mode") ?? "all") as FilterMode;
  const mapKeyword = searchParams.get("mapKeyword") ?? "";
  const userKey = searchParams.get("userKeyword") ?? "";
  const minKpm = Number(searchParams.get("minKpm") ?? DEFAULT_KPM_SEARCH_RANGE.min);
  const maxKpm = Number(searchParams.get("maxKpm"));
  const minClearRate = Number(
    searchParams.get("minClearRate") ?? DEFAULT_CLEAR_RATE_SEARCH_RANGE.min,
  );
  const maxClearRate = Number(searchParams.get("maxClearRate"));
  const minSpeed = Number(searchParams.get("minSpeed") ?? 1);
  const maxSpeed = Number(searchParams.get("maxSpeed"));

  const offset = USERS_RESULT_LIST_TAKE_LENGTH * Number(page); // 20件ずつ読み込むように変更

  try {
    const resultList = await prisma.$queryRaw`
      SELECT "Result"."id",
      "Result"."mapId",
      "Result"."userId",
      "Result"."updatedAt",
      "Result"."clearRate",
      "Result"."score",
      "Result"."miss",
      "Result"."lost",
      "Result"."rank",
      "Result"."kanaType",
      "Result"."romaType",
      "Result"."flickType",
      "Result"."kpm",
      "Result"."romaKpm",
      "Result"."defaultSpeed",
      "Result"."clapCount",
      json_build_object(
        'id', "Map"."id",
        'videoId', "Map"."videoId",
        'title', "Map"."title",
        'artistName', "Map"."artistName",
        'previewTime', "Map"."previewTime",
        'thumbnailQuality', "Map"."thumbnailQuality",
        'likeCount', "Map"."likeCount",
        'rankingCount', "Map"."rankingCount",
        'updatedAt', "Map"."updatedAt",
        'user', json_build_object(
          'id', "Creator"."id",
          'name', "Creator"."name"
        )
      ) as "map",
      json_build_object(
        'id', "Player"."id",
        'name', "Player"."name"
      ) as "user",
      (
        SELECT "isClaped"
        FROM "Clap"
        WHERE "Clap"."resultId" = "Result"."id"
        AND "Clap"."userId" = ${userId}
        LIMIT 1
      ) as "hasClap",
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
      FROM "Result"
      JOIN "Map" ON "Result"."mapId" = "Map"."id"
      JOIN "User" AS "Creator" ON "Map"."creatorId" = "Creator"."id"
      JOIN "User" AS "Player" ON "Result"."userId" = "Player"."id"
      WHERE (
        CASE
          WHEN ${mode} = 'roma' THEN "Result"."romaType" > 0 AND "Result"."kanaType" = 0
          WHEN ${mode} = 'kana' THEN "Result"."kanaType" > 0 AND "Result"."romaType" = 0
          WHEN ${mode} = 'romakana' THEN "Result"."kanaType" > 0 AND "Result"."romaType" > 0
          ELSE 1=1
        END
      )
      AND
      (
        CASE
          WHEN ${maxKpm} != 0 THEN "Result"."romaKpm" BETWEEN ${minKpm} AND (CASE WHEN ${maxKpm} = 1200 THEN "Result"."romaKpm" ELSE ${maxKpm} END)
          ELSE 1=1
        END
      )
      AND
      (
        CASE
          WHEN ${maxClearRate} != 0 THEN "Result"."clearRate" BETWEEN ${minClearRate} AND ${maxClearRate}
          ELSE 1=1
        END
      )
      AND
      (
        CASE
          WHEN ${maxSpeed} != 0 THEN "Result"."defaultSpeed" BETWEEN ${minSpeed} AND ${maxSpeed}
          ELSE 1=1
        END
      )
      AND
      (
        CASE
          WHEN ${userKey} != '' THEN "Player"."name" &@~ ${userKey}
          ELSE 1=1
        END
      )
      AND
      (
        CASE
          WHEN ${mapKeyword} != '' THEN "title" &@~ ${mapKeyword}
          OR "artistName" &@~ ${mapKeyword}
          OR "musicSource" &@~ ${mapKeyword}
          OR "tags" &@~ ${mapKeyword}
          OR "Creator"."name" &@~ ${mapKeyword}
          ELSE 1=1
        END
      )
      ORDER BY "Result"."updatedAt" DESC
      LIMIT ${USERS_RESULT_LIST_TAKE_LENGTH} OFFSET ${offset}
    `;

    return new Response(JSON.stringify(resultList), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching map list:", error);

    return new Response("Internal Server Error", { status: 500 });
  }
}
