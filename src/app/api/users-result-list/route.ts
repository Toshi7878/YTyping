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
    searchParams.get("minClearRate") ?? DEFAULT_CLEAR_RATE_SEARCH_RANGE.min
  );
  const maxClearRate = Number(searchParams.get("maxClearRate"));
  const minSpeed = Number(searchParams.get("minSpeed") ?? 1);
  const maxSpeed = Number(searchParams.get("maxSpeed"));

  const offset = USERS_RESULT_LIST_TAKE_LENGTH * Number(page); // 20件ずつ読み込むように変更

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
      WHERE (
        CASE
          WHEN ${mode} = 'roma' THEN "status"."roma_type" > 0 AND "status"."kana_type" = 0
          WHEN ${mode} = 'kana' THEN "status"."kana_type" > 0 AND "status"."roma_type" = 0
          WHEN ${mode} = 'romakana' THEN "status"."kana_type" > 0 AND "status"."roma_type" > 0
          ELSE 1=1
        END
      )
      AND
      (
        CASE
          WHEN ${maxKpm} != 0 THEN "status"."roma_kpm" BETWEEN ${minKpm} AND (CASE WHEN ${maxKpm} = 1200 THEN "status"."roma_kpm" ELSE ${maxKpm} END)
          ELSE 1=1
        END
      )
      AND
      (
        CASE
          WHEN ${maxClearRate} != 0 THEN "status"."clear_rate" BETWEEN ${minClearRate} AND ${maxClearRate}
          ELSE 1=1
        END
      )
      AND
      (
        CASE
          WHEN ${maxSpeed} != 0 THEN "status"."default_speed" BETWEEN ${minSpeed} AND ${maxSpeed}
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
          WHEN ${mapKeyword} != '' THEN map."title" &@~ ${mapKeyword}
          OR map."artist_name" &@~ ${mapKeyword}
          OR map."music_source" &@~ ${mapKeyword}
          OR map."tags" &@~ ${mapKeyword}
          OR creator."name" &@~ ${mapKeyword}
          ELSE 1=1
        END
      )
      ORDER BY results."updated_at" DESC
      LIMIT ${USERS_RESULT_LIST_TAKE_LENGTH} OFFSET ${offset}
    `;

    // const resultList = await prisma.$queryRaw`
    //   SELECT results."id",
    //   results."map_id",
    //   results."user_id",
    //   results."updated_at",
    //   results."clap_count",
    //   results."rank",
    //   json_build_object(
    //     'score', "status"."score",
    //     'miss', "status"."miss",
    //     'lost', "status"."lost",
    //     'rank', "status"."rank",
    //     'roma_type', "status"."roma_type",
    //     'kana_type', "status"."kana_type",
    //     'flick_type', "status"."flick_type",
    //     'kpm', "status"."kpm",
    //     'roma_kpm', "status"."roma_kpm",
    //     'clear_rate', "status"."clear_rate",
    //     'default_speed', "status"."default_speed",
    //   ) as "status",
    //   json_build_object(
    //     'id', maps."id",
    //     'video_id', maps."video_id",
    //     'title', maps."title",
    //     'artist_name', maps."artist_name",
    //     'music_source', maps."music_source",
    //     'preview_time', maps."preview_time",
    //     'thumbnail_quality', maps."thumbnail_quality",
    //     'like_count', maps."like_count",
    //     'ranking_count', maps."ranking_count",
    //     'updated_at', maps."updated_at",
    //     'creator', json_build_object(
    //       'id', creator."id",
    //       'name', creator."name"
    //     )
    //   ) as "map",
    //   json_build_object(
    //     'id', "Player"."id",
    //     'name', "Player"."name"
    //   ) as "user",
    //   (
    //     SELECT "is_claped"
    //     FROM result_claps
    //     WHERE result_claps."result_id" = results."id"
    //     AND result_claps."user_id" = ${userId}
    //     LIMIT 1
    //   ) as "hasClap",
    //   'map_likes', COALESCE(
    //     (
    //       SELECT array_agg(json_build_object('is_liked', "is_liked"))
    //       FROM map_likes
    //       WHERE map_likes."map_id" = maps."id"
    //       AND map_likes."user_id" = ${userId}
    //     ),
    //     ARRAY[]::json[]
    //   ) as map_likes,
    //   'results', COALESCE(
    //     (
    //       SELECT array_agg(json_build_object('rank', "rank"))
    //       FROM results
    //       WHERE results."map_id" = maps."id"
    //       AND user_id."user_id" = ${userId}
    //     ),
    //     ARRAY[]::json[]
    //   ) as results
    //   FROM results
    //   JOIN maps AS map ON results."map_id" = maps."id"
    //   JOIN result_statuses AS "status" ON results."map_id" = "status"."id"
    //   JOIN users AS creator ON maps."creator_id" = creator."id"
    //   JOIN users AS "Player" ON results."user_id" = "Player"."id"
    //   WHERE (
    //     CASE
    //       WHEN ${mode} = 'roma' THEN "status"."roma_type" > 0 AND "status"."kana_type" = 0
    //       WHEN ${mode} = 'kana' THEN "status"."kana_type" > 0 AND "status"."roma_type" = 0
    //       WHEN ${mode} = 'romakana' THEN "status"."kana_type" > 0 AND "status"."roma_type" > 0
    //       ELSE 1=1
    //     END
    //   )
    //   AND
    //   (
    //     CASE
    //       WHEN ${maxKpm} != 0 THEN results."roma_kpm" BETWEEN ${minKpm} AND (CASE WHEN ${maxKpm} = 1200 THEN results."roma_kpm" ELSE ${maxKpm} END)
    //       ELSE 1=1
    //     END
    //   )
    //   AND
    //   (
    //     CASE
    //       WHEN ${maxClearRate} != 0 THEN results."clear_rate" BETWEEN ${minClearRate} AND ${maxClearRate}
    //       ELSE 1=1
    //     END
    //   )
    //   AND
    //   (
    //     CASE
    //       WHEN ${maxSpeed} != 0 THEN results."default_speed" BETWEEN ${minSpeed} AND ${maxSpeed}
    //       ELSE 1=1
    //     END
    //   )
    //   AND
    //   (
    //     CASE
    //       WHEN ${userKey} != '' THEN "Player"."name" &@~ ${userKey}
    //       ELSE 1=1
    //     END
    //   )
    //   AND
    //   (
    //     CASE
    //       WHEN ${mapKeyword} != '' THEN "title" &@~ ${mapKeyword}
    //       OR "artist_name" &@~ ${mapKeyword}
    //       OR "music_source" &@~ ${mapKeyword}
    //       OR "tags" &@~ ${mapKeyword}
    //       OR creator."name" &@~ ${mapKeyword}
    //       ELSE 1=1
    //     END
    //   )
    //   ORDER BY results."updated_at" DESC
    //   LIMIT ${USERS_RESULT_LIST_TAKE_LENGTH} OFFSET ${offset}
    // `;

    return new Response(JSON.stringify(resultList), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching map list:", error);

    return new Response("Internal Server Error", { status: 500 });
  }
}
