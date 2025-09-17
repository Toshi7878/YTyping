import { DEFAULT_CLEAR_RATE_SEARCH_RANGE, DEFAULT_KPM_SEARCH_RANGE } from "@/app/timeline/_lib/consts";
import { supabase } from "@/lib/supabaseClient";
import { db, TXType } from "@/server/drizzle/client";
import { MapLikes, Maps, Notifications, ResultClaps, Results, ResultStatuses, Users } from "@/server/drizzle/schema";
import { CreateResultSchema, ResultData } from "@/server/drizzle/validator/result";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, gt, gte, ilike, inArray, lte, or, SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import z from "zod";
import { protectedProcedure, publicProcedure } from "../trpc";

const SelectFilterUserResultListSchema = z.object({
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

const SelectUsersResultInfiniteListSchema = SelectFilterUserResultListSchema.extend({
  cursor: z.string().nullable().optional(),
});

export const resultRouter = {
  usersResultList: publicProcedure.input(SelectUsersResultInfiniteListSchema).query(async ({ input, ctx }) => {
    const { db, user } = ctx;
    const PAGE_SIZE = 25;

    const userId = user?.id ? user.id : null;
    const page = input.cursor ? Number(input.cursor) : 0;
    const offset = isNaN(page) ? 0 : page * PAGE_SIZE;

    const Creator = alias(Users, "creator");
    const Player = alias(Users, "Player");
    const MyResult = alias(Results, "MyResult");

    const whereConds = [
      ...generateModeFilter({ mode: input.mode }),
      ...generateKpmFilter({ minKpm: input.minKpm, maxKpm: input.maxKpm }),
      ...generateClearRateFilter({ minClearRate: input.minClearRate, maxClearRate: input.maxClearRate }),
      ...generatePlaySpeedFilter({ minPlaySpeed: input.minPlaySpeed, maxPlaySpeed: input.maxPlaySpeed }),
      ...generateKeywordFilter({ username: input.username, mapKeyword: input.mapKeyword }),
    ];

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
          romaKpm: ResultStatuses.kanaToRomaConvertKpm,
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
  }),
  getTypingResultJson: publicProcedure.input(z.object({ resultId: z.number().nullable() })).query(async ({ input }) => {
    const timestamp = new Date().getTime();

    const { data, error } = await supabase.storage
      .from("user-result")
      .download(`public/${input.resultId}.json?timestamp=${timestamp}`);

    if (error) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }

    const jsonString = await data.text();
    const jsonData: ResultData = JSON.parse(jsonString);

    return jsonData;
  }),

  getMapRanking: publicProcedure.input(z.object({ mapId: z.number() })).query(async ({ input, ctx }) => {
    const { db, user } = ctx;
    const { mapId } = input;

    return db
      .select({
        id: Results.id,
        updatedAt: Results.updatedAt,
        player: { id: Results.userId, name: Users.name },
        clap: { count: Results.clapCount, hasClaped: ResultClaps.isClaped },
        score: ResultStatuses.score,
        otherStatus: {
          playSpeed: ResultStatuses.defaultSpeed,
          miss: ResultStatuses.miss,
          lost: ResultStatuses.lost,
          maxCombo: ResultStatuses.maxCombo,
          clearRate: ResultStatuses.clearRate,
        },
        typeSpeed: {
          kpm: ResultStatuses.kpm,
          rkpm: ResultStatuses.rkpm,
          kanaToRomaConvertKpm: ResultStatuses.kanaToRomaConvertKpm,
          kanaToRomaConvertRkpm: ResultStatuses.kanaToRomaConvertRKpm,
        },
        typeCounts: {
          romaType: ResultStatuses.romaType,
          kanaType: ResultStatuses.kanaType,
          flickType: ResultStatuses.flickType,
          englishType: ResultStatuses.englishType,
          symbolType: ResultStatuses.symbolType,
          spaceType: ResultStatuses.spaceType,
          numType: ResultStatuses.numType,
        },
      })
      .from(Results)
      .innerJoin(ResultStatuses, eq(ResultStatuses.resultId, Results.id))
      .innerJoin(Users, eq(Users.id, Results.userId))
      .leftJoin(ResultClaps, and(eq(ResultClaps.resultId, Results.id), eq(ResultClaps.userId, user.id ?? 0)))
      .where(eq(Results.mapId, mapId))
      .orderBy(desc(ResultStatuses.score));
  }),

  createResult: protectedProcedure.input(CreateResultSchema).mutation(async ({ input, ctx }) => {
    const { user } = ctx;
    const userId = user.id;
    const { mapId, lineResults, status } = input;

    return await db.transaction(async (tx) => {
      const resultId = await tx
        .insert(Results)
        .values({ mapId, userId })
        .onConflictDoUpdate({
          target: [Results.userId, Results.mapId],
          set: { updatedAt: new Date() },
        })
        .returning({ id: Results.id })
        .then((res) => res[0].id);

      await tx
        .insert(ResultStatuses)
        .values({ resultId })
        .onConflictDoUpdate({ target: [ResultStatuses.resultId], set: status });

      const jsonString = JSON.stringify(lineResults, null, 2);
      await supabase.storage
        .from("user-result")
        .upload(`public/${resultId}.json`, new Blob([jsonString], { type: "application/json" }), {
          upsert: true,
        });

      const rankedUsers = await tx
        .select({
          userId: Results.userId,
          rank: Results.rank,
          score: ResultStatuses.score,
        })
        .from(Results)
        .innerJoin(ResultStatuses, eq(ResultStatuses.resultId, Results.id))
        .where(eq(Results.mapId, mapId))
        .orderBy(desc(ResultStatuses.score));

      await cleanupOutdatedOvertakeNotifications({ tx, mapId, userId, rankedUsers });
      await updateRankingsAndNotifyOvertakes({ tx, mapId, userId, rankedUsers });

      await tx.update(Maps).set({ rankingCount: rankedUsers.length }).where(eq(Maps.id, mapId));

      return true;
    });
  }),
};

const cleanupOutdatedOvertakeNotifications = async ({
  tx,
  mapId,
  userId,
  rankedUsers,
}: {
  tx: TXType;
  mapId: number;
  userId: number;
  rankedUsers: { userId: number; rank: number; score: number }[];
}) => {
  const myResult = rankedUsers.find((record) => record.userId === userId);
  if (!myResult) return;

  const overtakeNotifications = await tx
    .select({
      visitorId: Notifications.visitorId,
      visitorScore: ResultStatuses.score,
    })
    .from(Notifications)
    .innerJoin(Results, and(eq(Results.userId, Notifications.visitorId), eq(Results.mapId, Notifications.mapId)))
    .innerJoin(ResultStatuses, eq(ResultStatuses.resultId, Results.id))
    .where(
      and(eq(Notifications.visitedId, userId), eq(Notifications.mapId, mapId), eq(Notifications.action, "OVER_TAKE")),
    );

  const notificationsToDelete = overtakeNotifications
    .filter((notification) => notification.visitorScore <= myResult.score)
    .map((notification) => notification.visitorId);

  if (notificationsToDelete.length > 0) {
    await tx
      .delete(Notifications)
      .where(
        and(
          inArray(Notifications.visitorId, notificationsToDelete),
          eq(Notifications.visitedId, userId),
          eq(Notifications.mapId, mapId),
          eq(Notifications.action, "OVER_TAKE"),
        ),
      );
  }
};

const updateRankingsAndNotifyOvertakes = async ({
  tx,
  mapId,
  userId,
  rankedUsers,
}: {
  tx: TXType;
  mapId: number;
  userId: number;
  rankedUsers: { userId: number; rank: number; score: number }[];
}) => {
  for (let index = 0; index < rankedUsers.length; index++) {
    const currentUser = rankedUsers[index];
    const updatedRank = index + 1;
    const previousRank = currentUser.rank;

    await tx
      .update(Results)
      .set({ rank: updatedRank })
      .where(and(eq(Results.mapId, mapId), eq(Results.userId, currentUser.userId)));

    const isNotCurrentUser = currentUser.userId !== userId;
    if (isNotCurrentUser && previousRank !== null && previousRank <= 5 && previousRank !== updatedRank) {
      await tx
        .insert(Notifications)
        .values({
          visitorId: userId,
          visitedId: currentUser.userId,
          mapId,
          action: "OVER_TAKE",
          oldRank: previousRank,
        })
        .onConflictDoUpdate({
          target: [Notifications.visitorId, Notifications.visitedId, Notifications.mapId, Notifications.action],
          set: {
            checked: false,
            createdAt: new Date(),
            oldRank: previousRank ?? null,
          },
        });
    }
  }
};

function generateModeFilter({ mode }: { mode: string }) {
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

function generateKpmFilter({ minKpm, maxKpm }: { minKpm: number; maxKpm: number }) {
  if (maxKpm === 0) return [];
  const conds: SQL<unknown>[] = [];
  if (typeof minKpm === "number") conds.push(gte(ResultStatuses.kanaToRomaConvertKpm, minKpm));
  if (typeof maxKpm === "number") {
    if (maxKpm !== DEFAULT_KPM_SEARCH_RANGE.max) conds.push(lte(ResultStatuses.kanaToRomaConvertKpm, maxKpm));
  }
  return conds;
}

function generateClearRateFilter({ minClearRate, maxClearRate }: { minClearRate: number; maxClearRate: number }) {
  if (maxClearRate === 0) return [];
  const conds: SQL<unknown>[] = [];
  if (typeof minClearRate === "number") conds.push(gte(ResultStatuses.clearRate, minClearRate));
  if (typeof maxClearRate === "number") conds.push(lte(ResultStatuses.clearRate, maxClearRate));
  return conds;
}

function generatePlaySpeedFilter({ minPlaySpeed, maxPlaySpeed }: { minPlaySpeed: number; maxPlaySpeed: number }) {
  if (maxPlaySpeed === 0) return [];
  const conds: SQL<unknown>[] = [];
  if (typeof minPlaySpeed === "number") conds.push(gte(ResultStatuses.defaultSpeed, minPlaySpeed));
  if (typeof maxPlaySpeed === "number") conds.push(lte(ResultStatuses.defaultSpeed, maxPlaySpeed));
  return conds;
}

function generateKeywordFilter({ username, mapKeyword }: { username: string; mapKeyword: string }) {
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
