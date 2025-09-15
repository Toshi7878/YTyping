import { LineResultData } from "@/app/(typing)/type/_lib/type";
import { DEFAULT_CLEAR_RATE_SEARCH_RANGE, DEFAULT_KPM_SEARCH_RANGE } from "@/app/timeline/_lib/consts";
import { FilterMode } from "@/app/timeline/_lib/type";
import { supabase } from "@/lib/supabaseClient";
import { db as drizzleDb, schema } from "@/server/drizzle/client";
import { MapLikes, Maps, ResultClaps, Results, ResultStatuses, Users } from "@/server/drizzle/schema";
import { and, desc, eq, gt, gte, ilike, lte, or, SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
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
    const { db, user } = ctx;
    const PAGE_SIZE = 25;

    const userId = user?.id ? Number(user.id) : null;
    const page = input.cursor ? Number(input.cursor) : 0;
    const offset = isNaN(page) ? 0 : page * PAGE_SIZE;

    const Creator = alias(Users, "creator");
    const Player = alias(Users, "Player");
    const MyResult = alias(Results, "MyResult");

    const whereConds = [
      ...generateModeFilter({ mode: input.mode as FilterMode }),
      ...generateKpmFilter({ minKpm: input.minKpm, maxKpm: input.maxKpm }),
      ...generateClearRateFilter({ minClearRate: input.minClearRate, maxClearRate: input.maxClearRate }),
      ...generatePlaySpeedFilter({ minPlaySpeed: input.minPlaySpeed, maxPlaySpeed: input.maxPlaySpeed }),
      ...generateKeywordFilter({ username: input.username, mapKeyword: input.mapKeyword }),
    ];

    try {
      const items = await db
        .select({
          id: Results.id,
          updatedAt: Results.updatedAt,
          rank: Results.rank,
          player: {
            id: Player.id,
            name: Player.name,
          },
          status: {
            score: ResultStatuses.score,
            miss: ResultStatuses.miss,
            lost: ResultStatuses.lost,
            romaType: ResultStatuses.romaType,
            kanaType: ResultStatuses.kanaType,
            flickType: ResultStatuses.flickType,
            englishType: ResultStatuses.englishType,
            numType: ResultStatuses.numType,
            symbolType: ResultStatuses.symbolType,
            spaceType: ResultStatuses.spaceType,
            kpm: ResultStatuses.kpm,
            romaKpm: ResultStatuses.romaKpm,
            clearRate: ResultStatuses.clearRate,
            playSpeed: ResultStatuses.defaultSpeed,
          },
          map: {
            id: Maps.id,
            videoId: Maps.videoId,
            title: Maps.title,
            artistName: Maps.artistName,
            musicSource: Maps.musicSource,
            previewTime: Maps.previewTime,
            thumbnailQuality: Maps.thumbnailQuality,
            likeCount: Maps.likeCount,
            rankingCount: Maps.rankingCount,
            updatedAt: Maps.updatedAt,
            creatorId: Creator.id,
            creatorName: Creator.name,
            hasLiked: MapLikes.isLiked,
            myRank: MyResult.rank,
          },
          clap: {
            count: Results.clapCount,
            hasClaped: ResultClaps.isClaped,
          },
        })
        .from(Results)
        .innerJoin(Maps, eq(Maps.id, Results.mapId))
        .innerJoin(ResultStatuses, eq(ResultStatuses.resultId, Results.id))
        .innerJoin(Creator, eq(Creator.id, Maps.creatorId))
        .innerJoin(Player, eq(Player.id, Results.userId))
        .leftJoin(MapLikes, and(eq(MapLikes.mapId, Maps.id), eq(MapLikes.userId, userId ?? 0)))
        .leftJoin(MyResult, and(eq(MyResult.mapId, Maps.id), eq(MyResult.userId, userId ?? 0)))
        .leftJoin(ResultClaps, and(eq(ResultClaps.resultId, Results.id), eq(ResultClaps.userId, userId ?? 0)))
        .where(whereConds.length ? and(...whereConds) : undefined)
        .orderBy(desc(Results.updatedAt))
        .limit(PAGE_SIZE + 1)
        .offset(offset);

      let nextCursor: string | undefined = undefined;
      if (items.length > PAGE_SIZE) {
        items.pop();
        nextCursor = String(isNaN(page) ? 1 : page + 1);
      }

      return { items, nextCursor };
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
interface GenerateModeFilter {
  mode: string;
}

function generateModeFilter({ mode }: GenerateModeFilter) {
  switch (mode) {
    case "roma":
      return [gt(ResultStatuses.romaType, 0), eq(ResultStatuses.kanaType, 0)];
    case "kana":
      return [gt(ResultStatuses.kanaType, 0), eq(ResultStatuses.romaType, 0)];
    case "romakana":
      return [gt(ResultStatuses.kanaType, 0), gt(ResultStatuses.romaType, 0)];
    case "english":
      return [eq(ResultStatuses.kanaType, 0), eq(ResultStatuses.romaType, 0), gt(ResultStatuses.englishType, 0)];
    case "all":
    default:
      return [];
  }
}

interface GenerateKpmFilter {
  minKpm: number;
  maxKpm: number;
}

function generateKpmFilter({ minKpm, maxKpm }: GenerateKpmFilter) {
  if (maxKpm === 0) return [] as any[];
  const conds: any[] = [];
  if (typeof minKpm === "number") conds.push(gte(ResultStatuses.romaKpm, minKpm));
  if (typeof maxKpm === "number") {
    if (maxKpm !== DEFAULT_KPM_SEARCH_RANGE.max) conds.push(lte(ResultStatuses.romaKpm, maxKpm));
  }
  return conds;
}

interface GenerateClearRateFilter {
  minClearRate: number;
  maxClearRate: number;
}

function generateClearRateFilter({ minClearRate, maxClearRate }: GenerateClearRateFilter) {
  if (maxClearRate === 0) return [] as any[];
  const conds: any[] = [];
  if (typeof minClearRate === "number") conds.push(gte(ResultStatuses.clearRate, minClearRate));
  if (typeof maxClearRate === "number") conds.push(lte(ResultStatuses.clearRate, maxClearRate));
  return conds;
}

interface GeneratePlaySpeedFilter {
  minPlaySpeed: number;
  maxPlaySpeed: number;
}

function generatePlaySpeedFilter({ minPlaySpeed, maxPlaySpeed }: GeneratePlaySpeedFilter) {
  if (maxPlaySpeed === 0) return [] as any[];
  const conds: any[] = [];
  if (typeof minPlaySpeed === "number") conds.push(gte(ResultStatuses.defaultSpeed, minPlaySpeed));
  if (typeof maxPlaySpeed === "number") conds.push(lte(ResultStatuses.defaultSpeed, maxPlaySpeed));
  return conds;
}

interface GenerateKeywordFilter {
  username: string;
  mapKeyword: string;
}

function generateKeywordFilter({ username, mapKeyword }: GenerateKeywordFilter) {
  const conds: SQL<unknown>[] = [];
  if (username && username.trim() !== "") {
    const pattern = `%${username}%`;
    conds.push(ilike(Users.name, pattern));
  }
  if (mapKeyword && mapKeyword.trim() !== "") {
    const pattern = `%${mapKeyword}%`;
    const keywordOr: SQL<unknown> = or(
      ilike(Maps.title, pattern),
      ilike(Maps.artistName, pattern),
      ilike(Maps.musicSource, pattern),
      ilike(Users.name, pattern),
    ) as unknown as SQL<unknown>;
    conds.push(keywordOr);
  }
  return conds;
}
