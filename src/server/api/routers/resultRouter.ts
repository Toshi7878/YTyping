import { LineResultData } from "@/app/(typing)/type/_lib/type";
import { DEFAULT_CLEAR_RATE_SEARCH_RANGE, DEFAULT_KPM_SEARCH_RANGE, PAGE_SIZE } from "@/app/timeline/_lib/consts";
import { FilterMode, TimelineResult } from "@/app/timeline/_lib/type";
import { supabase } from "@/lib/supabaseClient";
import { Prisma, PrismaClient } from "@prisma/client";
import z from "zod";
import { protectedProcedure, publicProcedure } from "../trpc";
import { sendResultSchema } from "./rankingRouter";

const usersResultListSchema = z.object({
  limit: z.number().min(1).max(100).default(PAGE_SIZE),
  cursor: z.string().optional(),
  mode: z.string().default("all"),
  minKpm: z.number().default(DEFAULT_KPM_SEARCH_RANGE.min),
  maxKpm: z.number().default(DEFAULT_KPM_SEARCH_RANGE.max),
  minClearRate: z.number().default(DEFAULT_CLEAR_RATE_SEARCH_RANGE.min),
  maxClearRate: z.number().default(DEFAULT_CLEAR_RATE_SEARCH_RANGE.max),
  minPlaySpeed: z.number().default(1),
  maxPlaySpeed: z.number().default(2),
  username: z.string().default(""),
  mapKeyword: z.string().default(""),
});

export const resultRouter = {
  usersResultList: publicProcedure.input(usersResultListSchema).query(async ({ input, ctx }) => {
    const { db, user } = ctx;
    const userId = user?.id ? Number(user.id) : null;
    const limit = input.limit;

    // カーソル条件を作成
    const cursorCondition = input.cursor
      ? Prisma.sql`AND results."updated_at" < ${new Date(input.cursor)}`
      : Prisma.empty;

    const modeFilter = generateModeFilterSql({ mode: input.mode as FilterMode });
    const kpmFilter = generateKpmFilterSql({
      minKpm: input.minKpm,
      maxKpm: input.maxKpm,
    });
    const clearRateFilter = generateClearRateFilterSql({
      minClearRate: input.minClearRate,
      maxClearRate: input.maxClearRate,
    });
    const playSpeedFilter = generatePlaySpeedFilterSql({
      minPlaySpeed: input.minPlaySpeed,
      maxPlaySpeed: input.maxPlaySpeed,
    });
    const keywordFilter = generateKeywordFilterSql({
      username: input.username,
      mapKeyword: input.mapKeyword,
    });

    const whereConditions = [modeFilter, kpmFilter, clearRateFilter, playSpeedFilter, ...keywordFilter];
    const where = Prisma.sql`${Prisma.join(whereConditions, ` AND `)} ${cursorCondition}`;

    try {
      // limit + 1を取得して次のページの存在を確認
      const resultList = await db.$queryRaw`
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
        'is_liked', EXISTS (
          SELECT 1
          FROM map_likes ml2
          WHERE ml2."map_id" = map."id"
          AND ml2."user_id" = ${userId}
          AND ml2."is_liked" = true
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
          LIMIT ${limit + 1}
        `;

      // 型キャストと型を追加
      const items = resultList as TimelineResult[];

      let nextCursor: string | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        if (nextItem) {
          nextCursor = nextItem.updated_at.toISOString();
        }
      }

      return {
        items,
        nextCursor,
      };
    } catch (error) {
      throw new Error("Failed to fetch users result list");
    }
  }),
  getUserResultData: publicProcedure.input(z.object({ resultId: z.number().nullable() })).query(async ({ input }) => {
    try {
      const timestamp = new Date().getTime();

      const { data, error } = await supabase.storage
        .from("user-result")
        .download(`public/${input.resultId}.json?timestamp=${timestamp}`);

      if (error) {
        console.error("Error downloading from Supabase:", error);
        throw error;
      }

      const jsonString = await data.text();
      const jsonData: LineResultData[] = JSON.parse(jsonString);

      return jsonData;
    } catch (error) {
      console.error("Error processing the downloaded file:", error);
      throw error;
    }
  }),
  sendResult: protectedProcedure.input(sendResultSchema).mutation(async ({ input, ctx }) => {
    const { db, user } = ctx;
    const mapId = input.mapId;
    const lineResults = input.lineResults;

    return await db.$transaction(async (tx) => {
      await sendResult({
        db: tx,
        lineResults,
        map_id: mapId,
        status: input.status,
        userId: user.id,
      });

      await calcRank({
        db: tx,
        mapId,
        userId: user.id,
      });

      return true;
    });
  }),
};

const calcRank = async ({
  db,
  mapId,
  userId,
}: {
  db: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;
  mapId: number;
  userId: number;
}) => {
  try {
    const rankingList = await db.results.findMany({
      where: { map_id: mapId },
      select: {
        user_id: true,
        rank: true,
        status: { select: { score: true } },
      },
      orderBy: { status: { score: "desc" } },
    });

    await processOvertakeNotifications(db, mapId, userId, rankingList);

    await updateRanksAndCreateNotifications(db, mapId, userId, rankingList);

    await updateMapRankingCount(db, mapId, rankingList.length);
  } catch (error) {
    console.error("ランク計算中にエラーが発生しました:", error);
    throw error;
  }
};

const processOvertakeNotifications = async (
  db: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
  mapId: number,
  userId: number,
  rankingList: { user_id: number; rank: number | null; status: { score: number } | null }[],
) => {
  const overtakeNotify = await db.notifications.findMany({
    where: {
      visited_id: userId,
      map_id: mapId,
      action: "OVER_TAKE",
    },
    select: {
      visitorResult: {
        select: {
          user_id: true,
          status: { select: { score: true } },
        },
      },
    },
  });

  const myResult = rankingList.find((record) => record.user_id === userId);
  if (!myResult || !myResult.status) return;

  const myScore = myResult.status.score;

  for (const notification of overtakeNotify) {
    const visitorScore = notification.visitorResult.status?.score;
    if (!visitorScore || visitorScore - myScore <= 0) {
      const visitorId = notification.visitorResult.user_id;
      await db.notifications.delete({
        where: {
          visitor_id_visited_id_map_id_action: {
            visitor_id: visitorId,
            visited_id: userId,
            map_id: mapId,
            action: "OVER_TAKE",
          },
        },
      });
    }
  }
};

const updateRanksAndCreateNotifications = async (
  db: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
  mapId: number,
  userId: number,
  rankingList: { user_id: number; rank: number | null; status: { score: number } | null }[],
) => {
  for (let i = 0; i < rankingList.length; i++) {
    const user = rankingList[i];
    const newRank = i + 1;
    const oldRank = user.rank;

    await db.results.update({
      where: {
        user_id_map_id: {
          map_id: mapId,
          user_id: user.user_id,
        },
      },
      data: { rank: newRank },
    });

    const isOtherUser = user.user_id !== userId;
    if (isOtherUser && oldRank !== null && oldRank <= 5 && oldRank !== newRank) {
      await db.notifications.upsert({
        where: {
          visitor_id_visited_id_map_id_action: {
            visitor_id: userId,
            visited_id: user.user_id,
            map_id: mapId,
            action: "OVER_TAKE",
          },
        },
        update: {
          checked: false,
          created_at: new Date(),
          old_rank: oldRank,
        },
        create: {
          visitor_id: userId,
          visited_id: user.user_id,
          map_id: mapId,
          action: "OVER_TAKE",
          old_rank: oldRank,
        },
      });
    }
  }
};

const updateMapRankingCount = async (
  db: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
  mapId: number,
  rankingCount: number,
) => {
  await db.maps.update({
    where: { id: mapId },
    data: { ranking_count: rankingCount },
  });
};

const sendResult = async ({
  db,
  map_id,
  status,
  lineResults,
  userId,
}: {
  db: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;
  map_id: number;
  status: z.infer<typeof sendResultSchema>["status"];
  lineResults: z.infer<typeof sendResultSchema>["lineResults"];
  userId: number;
}) => {
  const { id: resultId } = await db.results.upsert({
    where: {
      user_id_map_id: {
        user_id: userId,
        map_id,
      },
    },
    update: {
      updated_at: new Date(),
    },
    create: {
      map_id: map_id,
      user_id: userId,
    },
  });

  await db.result_statuses.upsert({
    where: {
      result_id: resultId,
    },
    update: {
      ...status,
    },
    create: {
      result_id: resultId,
      ...status,
    },
  });

  const jsonString = JSON.stringify(lineResults, null, 2);

  await supabase.storage
    .from("user-result") // バケット名を指定
    .upload(`public/${resultId}.json`, new Blob([jsonString], { type: "application/json" }), {
      upsert: true, // 既存のファイルを上書きするオプションを追加
    });
};

// Helper functions for SQL generation
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
