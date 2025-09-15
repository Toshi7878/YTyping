import { LineResultData } from "@/app/(typing)/type/_lib/type";
import { DEFAULT_CLEAR_RATE_SEARCH_RANGE, DEFAULT_KPM_SEARCH_RANGE } from "@/app/timeline/_lib/consts";
import { FilterMode, TimelineResult } from "@/app/timeline/_lib/type";
import { supabase } from "@/lib/supabaseClient";
import { db as drizzleDb, schema } from "@/server/drizzle/client";
import { and, desc, eq, sql } from "drizzle-orm";
import z from "zod";
import { protectedProcedure, publicProcedure } from "../trpc";
import { sendResultSchema } from "./rankingRouter";

const usersResultListSchema = z.object({
  cursor: z.string().nullable().optional(),
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
    const { user } = ctx;
    const PAGE_SIZE = 25;

    const userId = user?.id ? Number(user.id) : null;
    const page = input.cursor ? Number(input.cursor) : 0;
    const offset = isNaN(page) ? 0 : page * PAGE_SIZE;

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
    const where = sql`${sql.join(whereConditions, sql` AND `)}`;

    try {
      // limit + 1を取得して次のページの存在を確認
      const items: TimelineResult[] = (
        await drizzleDb.execute(sql`
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
        'is_liked', EXISTS (
          SELECT 1
          FROM map_likes ml2
          WHERE ml2."map_id" = map."id"
          AND ml2."user_id" = ${userId}
          AND ml2."is_liked" = true
        ),
        'myRank',
        (
          SELECT MIN(r."rank")::int
          FROM results r
          WHERE r."map_id" = map."id"
            AND r."user_id" = ${userId}
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
          LIMIT ${PAGE_SIZE + 1}
          OFFSET ${offset}
        `)
      ).rows as any;

      let nextCursor: string | undefined = undefined;
      if (items.length > PAGE_SIZE) {
        items.pop();
        nextCursor = String(isNaN(page) ? 1 : page + 1);
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
    const { user } = ctx;
    const mapId = input.mapId;
    const lineResults = input.lineResults;

    return await drizzleDb.transaction(async (tx) => {
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

const calcRank = async ({ db, mapId, userId }: { db: any; mapId: number; userId: number }) => {
  try {
    const rankingList = await db
      .select({
        user_id: schema.Results.userId,
        rank: schema.Results.rank,
        score: schema.ResultStatuses.score,
      })
      .from(schema.Results)
      .leftJoin(schema.ResultStatuses, eq(schema.ResultStatuses.resultId, schema.Results.id))
      .where(eq(schema.Results.mapId, mapId))
      .orderBy(desc(schema.ResultStatuses.score));

    const shaped = rankingList.map((r: any) => ({
      user_id: r.user_id,
      rank: r.rank,
      status: { score: r.score ?? 0 },
    }));

    await processOvertakeNotifications(db, mapId, userId, shaped);

    await updateRanksAndCreateNotifications(db, mapId, userId, shaped);

    await updateMapRankingCount(db, mapId, rankingList.length);
  } catch (error) {
    console.error("ランク計算中にエラーが発生しました:", error);
    throw error;
  }
};

const processOvertakeNotifications = async (
  db: any,
  mapId: number,
  userId: number,
  rankingList: { user_id: number; rank: number | null; status: { score: number } | null }[],
) => {
  const overtakeNotify = await db
    .select({
      visitorUserId: schema.Results.userId,
      visitorScore: schema.ResultStatuses.score,
    })
    .from(schema.Notifications)
    .innerJoin(
      schema.Results,
      and(
        eq(schema.Results.userId, schema.Notifications.visitorId),
        eq(schema.Results.mapId, schema.Notifications.mapId),
      ),
    )
    .leftJoin(schema.ResultStatuses, eq(schema.ResultStatuses.resultId, schema.Results.id))
    .where(
      and(
        eq(schema.Notifications.visitedId, userId),
        eq(schema.Notifications.mapId, mapId),
        eq(schema.Notifications.action, "OVER_TAKE" as any),
      ),
    );

  const myResult = rankingList.find((record) => record.user_id === userId);
  if (!myResult || !myResult.status) return;

  const myScore = myResult.status.score;

  for (const notification of overtakeNotify) {
    const visitorScore = notification.visitorScore ?? null;
    if (!visitorScore || visitorScore - myScore <= 0) {
      const visitorId = notification.visitorUserId;
      await db
        .delete(schema.Notifications)
        .where(
          and(
            eq(schema.Notifications.visitorId, visitorId),
            eq(schema.Notifications.visitedId, userId),
            eq(schema.Notifications.mapId, mapId),
            eq(schema.Notifications.action, "OVER_TAKE" as any),
          ),
        );
    }
  }
};

const updateRanksAndCreateNotifications = async (
  db: any,
  mapId: number,
  userId: number,
  rankingList: { user_id: number; rank: number | null; status: { score: number } | null }[],
) => {
  for (let i = 0; i < rankingList.length; i++) {
    const user = rankingList[i];
    const newRank = i + 1;
    const oldRank = user.rank;

    await db
      .update(schema.Results)
      .set({ rank: newRank })
      .where(and(eq(schema.Results.mapId, mapId), eq(schema.Results.userId, user.user_id)));

    const isOtherUser = user.user_id !== userId;
    if (isOtherUser && oldRank !== null && oldRank <= 5 && oldRank !== newRank) {
      await db
        .insert(schema.Notifications)
        .values({
          visitorId: userId,
          visitedId: user.user_id,
          mapId,
          action: "OVER_TAKE" as any,
          oldRank: oldRank ?? undefined,
        })
        .onConflictDoUpdate({
          target: [
            schema.Notifications.visitorId,
            schema.Notifications.visitedId,
            schema.Notifications.mapId,
            schema.Notifications.action,
          ],
          set: { checked: false, createdAt: new Date(), oldRank: oldRank ?? null },
        });
    }
  }
};

const updateMapRankingCount = async (db: any, mapId: number, rankingCount: number) => {
  await db.update(schema.Maps).set({ rankingCount }).where(eq(schema.Maps.id, mapId));
};

const sendResult = async ({
  db,
  map_id,
  status,
  lineResults,
  userId,
}: {
  db: any;
  map_id: number;
  status: z.infer<typeof sendResultSchema>["status"];
  lineResults: z.infer<typeof sendResultSchema>["lineResults"];
  userId: number;
}) => {
  const inserted = await db
    .insert(schema.Results)
    .values({ mapId: map_id, userId })
    .onConflictDoUpdate({
      target: [schema.Results.userId, schema.Results.mapId],
      set: { updatedAt: new Date() },
    })
    .returning({ id: schema.Results.id });

  const resultId = inserted[0]!.id;

  const mappedStatus = {
    resultId,
    score: status.score,
    kanaType: status.kana_type,
    romaType: status.roma_type,
    flickType: status.flick_type,
    englishType: status.english_type,
    spaceType: status.space_type,
    symbolType: status.symbol_type,
    numType: status.num_type,
    miss: status.miss,
    lost: status.lost,
    maxCombo: status.max_combo,
    kpm: status.kpm,
    rkpm: status.rkpm,
    romaKpm: status.roma_kpm,
    romaRkpm: status.roma_rkpm,
    defaultSpeed: status.default_speed,
    clearRate: status.clear_rate,
  } as const;

  await db
    .insert(schema.ResultStatuses)
    .values(mappedStatus)
    .onConflictDoUpdate({ target: [schema.ResultStatuses.resultId], set: { ...mappedStatus } });

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
  if (mode === "all") return sql.raw("1=1");

  return sql`(
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
  if (maxKpm === 0) return sql.raw("1=1");

  if (maxKpm === DEFAULT_KPM_SEARCH_RANGE.max) {
    return sql`("status"."roma_kpm" >= ${minKpm})`;
  }

  return sql`("status"."roma_kpm" BETWEEN ${minKpm} AND ${maxKpm})`;
}

interface GenerateClearRateFilterSql {
  minClearRate: number;
  maxClearRate: number;
}

function generateClearRateFilterSql({ minClearRate, maxClearRate }: GenerateClearRateFilterSql) {
  if (maxClearRate === 0) return sql.raw("1=1");

  return sql`("status"."clear_rate" BETWEEN ${minClearRate} AND ${maxClearRate})`;
}

interface GeneratePlaySpeedFilterSql {
  minPlaySpeed: number;
  maxPlaySpeed: number;
}

function generatePlaySpeedFilterSql({ minPlaySpeed, maxPlaySpeed }: GeneratePlaySpeedFilterSql) {
  if (maxPlaySpeed === 0) return sql.raw("1=1");

  return sql`("status"."default_speed" BETWEEN ${minPlaySpeed} AND ${maxPlaySpeed})`;
}

interface GenerateKeywordFilterSql {
  username: string;
  mapKeyword: string;
}

function generateKeywordFilterSql({ username, mapKeyword }: GenerateKeywordFilterSql) {
  const usernameCondition = username !== "" ? sql`("Player"."name" &@~ ${username})` : sql.raw("1=1");

  const mapKeywordCondition =
    mapKeyword !== ""
      ? sql`(
      map."title" &@~ ${mapKeyword} OR
      map."artist_name" &@~ ${mapKeyword} OR
      map."music_source" &@~ ${mapKeyword} OR
      map."tags" &@~ ${mapKeyword} OR
      creator."name" &@~ ${mapKeyword}
      )`
      : sql.raw("1=1");

  return [usernameCondition, mapKeywordCondition];
}
