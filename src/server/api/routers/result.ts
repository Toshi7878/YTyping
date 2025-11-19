import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import type { SQL } from "drizzle-orm";
import { and, count, desc, eq, gt, gte, ilike, inArray, lte, max, or, sql } from "drizzle-orm";
import { alias, type BuildAliasTable } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import z from "zod";
import { downloadPublicFile, uploadPublicFile } from "@/server/api/utils/storage";
import type { TXType } from "@/server/drizzle/client";
import { db } from "@/server/drizzle/client";
import {
  MapDifficulties,
  MapLikes,
  Maps,
  NotificationOverTakes,
  Notifications,
  ResultClaps,
  ResultStatuses,
  Results,
  Users,
} from "@/server/drizzle/schema";
import type { RESULT_INPUT_METHOD_TYPES, TypingLineResults } from "@/validator/result";
import {
  CLEAR_RATE_LIMIT,
  CreateResultSchema,
  KPM_LIMIT,
  PLAY_SPEED_LIMIT,
  SelectResultListApiSchema,
  SelectResultListByPlayerIdApiSchema,
} from "@/validator/result";
import { protectedProcedure, publicProcedure, type TRPCContext } from "../trpc";
import { createPagination } from "../utils/pagination";
import type { MapListItem } from "./map-list";

const createResultBaseFields = (Player: BuildAliasTable<typeof Users, "Player">) => {
  return {
    id: Results.id,
    updatedAt: Results.updatedAt,
    rank: Results.rank,
    score: ResultStatuses.score,
    player: { id: Player.id, name: Player.name },
    typeCounts: {
      romaType: ResultStatuses.romaType,
      kanaType: ResultStatuses.kanaType,
      flickType: ResultStatuses.flickType,
      englishType: ResultStatuses.englishType,
      symbolType: ResultStatuses.symbolType,
      spaceType: ResultStatuses.spaceType,
      numType: ResultStatuses.numType,
    },
    otherStatus: {
      playSpeed: ResultStatuses.minPlaySpeed,
      miss: ResultStatuses.miss,
      lost: ResultStatuses.lost,
      maxCombo: ResultStatuses.maxCombo,
      clearRate: ResultStatuses.clearRate,
    },
    typeSpeed: {
      kpm: ResultStatuses.kpm,
      rkpm: ResultStatuses.rkpm,
      kanaToRomaKpm: ResultStatuses.kanaToRomaKpm,
      kanaToRomaRkpm: ResultStatuses.kanaToRomaRkpm,
    },
    clap: { count: Results.clapCount, hasClapped: ResultClaps.hasClapped },
  };
};

const createResultWithMapBaseSelect = ({
  user,
  alias: tableAlias,
}: {
  user: TRPCContext["user"];
  alias: {
    Player: BuildAliasTable<typeof Users, "Player">;
    Creator: BuildAliasTable<typeof Users, "Creator">;
  };
}) => {
  const { Player, Creator } = tableAlias;
  const resultSelectFields = createResultBaseFields(Player);

  const MyResult = alias(Results, "MyResult");

  const mapSelectFields = {
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
    duration: Maps.duration,
    romaKpmMedian: MapDifficulties.romaKpmMedian,
    romaKpmMax: MapDifficulties.romaKpmMax,
    hasLiked: sql<boolean>`COALESCE(${MapLikes.hasLiked}, false)`,
    myRank: MyResult.rank,
    myRankUpdatedAt: MyResult.updatedAt,
  };

  return db
    .select({ ...resultSelectFields, map: mapSelectFields })
    .from(Results)
    .innerJoin(Maps, eq(Maps.id, Results.mapId))
    .innerJoin(ResultStatuses, eq(ResultStatuses.resultId, Results.id))
    .innerJoin(Creator, eq(Creator.id, Maps.creatorId))
    .innerJoin(Player, eq(Player.id, Results.userId))
    .innerJoin(MapDifficulties, eq(MapDifficulties.mapId, Maps.id))
    .leftJoin(MapLikes, and(eq(MapLikes.mapId, Maps.id), eq(MapLikes.userId, user?.id ?? 0)))
    .leftJoin(MyResult, and(eq(MyResult.mapId, Maps.id), eq(MyResult.userId, user?.id ?? 0)))
    .leftJoin(
      ResultClaps,
      user
        ? and(eq(ResultClaps.resultId, Results.id), eq(ResultClaps.userId, user.id))
        : eq(ResultClaps.resultId, Results.id),
    );
};

const toMapListItem = (items: Awaited<ReturnType<typeof createResultWithMapBaseSelect>>) => {
  return items.map(({ map: m, ...rest }) => {
    return {
      ...rest,
      map: {
        id: m.id,
        updatedAt: m.updatedAt,
        media: {
          videoId: m.videoId,
          previewTime: m.previewTime,
          thumbnailQuality: m.thumbnailQuality,
          previewSpeed: rest.otherStatus.playSpeed,
        },
        info: { title: m.title, artistName: m.artistName, source: m.musicSource, duration: m.duration },
        creator: { id: m.creatorId, name: m.creatorName },
        difficulty: { romaKpmMedian: m.romaKpmMedian, romaKpmMax: m.romaKpmMax },
        like: { count: m.likeCount, hasLiked: m.hasLiked },
        ranking: { count: m.rankingCount, myRank: m.myRank, myRankUpdatedAt: m.myRankUpdatedAt },
      } satisfies MapListItem,
    };
  });
};

export type ResultWithMapItem = ReturnType<typeof toMapListItem>[number];

const PAGE_SIZE = 25;

const resultListWithMapRoute = {
  getAllWithMap: publicProcedure.input(SelectResultListApiSchema).query(async ({ input, ctx }) => {
    const { user } = ctx;

    const { limit, offset, buildPageResult } = createPagination(input?.cursor, PAGE_SIZE);

    const Player = alias(Users, "Player");
    const Creator = alias(Users, "Creator");

    const whereConds = [
      ...generateModeFilter({ mode: input.mode }),
      ...generateKpmFilter({ minKpm: input.minKpm, maxKpm: input.maxKpm }),
      ...generateClearRateFilter({ minClearRate: input.minClearRate, maxClearRate: input.maxClearRate }),
      ...generatePlaySpeedFilter({ minPlaySpeed: input.minPlaySpeed, maxPlaySpeed: input.maxPlaySpeed }),
      ...generateKeywordFilter({
        username: input.username,
        mapKeyword: input.mapKeyword,
        PlayerName: Player.name,
        CreatorName: Creator.name,
      }),
    ];

    const items = await createResultWithMapBaseSelect({ user, alias: { Player, Creator } })
      .where(whereConds.length ? and(...whereConds) : undefined)
      .orderBy(desc(Results.updatedAt))
      .limit(limit)
      .offset(offset);

    return buildPageResult(toMapListItem(items));
  }),

  getAllWithMapByUserId: publicProcedure.input(SelectResultListByPlayerIdApiSchema).query(async ({ input, ctx }) => {
    const { user } = ctx;
    const { playerId } = input;
    const { limit, offset, buildPageResult } = createPagination(input?.cursor, PAGE_SIZE);

    const Player = alias(Users, "Player");
    const Creator = alias(Users, "Creator");

    const items = await createResultWithMapBaseSelect({ user, alias: { Player, Creator } })
      .where(eq(Results.userId, playerId))
      .orderBy(desc(Results.updatedAt))
      .limit(limit)
      .offset(offset);

    return buildPageResult(toMapListItem(items));
  }),

  getUserResultStats: publicProcedure.input(z.object({ userId: z.number() })).query(async ({ input, ctx }) => {
    const { db } = ctx;
    const { userId } = input;

    return db
      .select({
        totalResults: count(),
        firstRankCount: sql<number>`cast(count(*) filter (where ${Results.rank} = 1) as int)`,
      })
      .from(Results)
      .where(eq(Results.userId, userId))
      .then((rows) => rows[0] ?? { totalResults: 0, firstRankCount: 0 });
  }),
} satisfies TRPCRouterRecord;

export const resultRouter = {
  ...resultListWithMapRoute,
  getResultJson: publicProcedure.input(z.object({ resultId: z.number().nullable() })).query(async ({ input }) => {
    const data = await downloadPublicFile(`result-json/${input.resultId}.json`);

    if (!data) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Result data not found" });
    }

    const jsonString = new TextDecoder().decode(data);
    const jsonData: TypingLineResults = JSON.parse(jsonString);

    return jsonData;
  }),

  getMapRanking: publicProcedure.input(z.object({ mapId: z.number() })).query(async ({ input, ctx }) => {
    const { db, user } = ctx;
    const { mapId } = input;

    const Player = alias(Users, "Player");
    const schema = createResultBaseFields(Player);

    return db
      .select(schema)
      .from(Results)
      .innerJoin(ResultStatuses, eq(ResultStatuses.resultId, Results.id))
      .innerJoin(Player, eq(Player.id, Results.userId))
      .leftJoin(
        ResultClaps,
        user
          ? and(eq(ResultClaps.resultId, Results.id), eq(ResultClaps.userId, user.id))
          : eq(ResultClaps.resultId, Results.id),
      )
      .where(eq(Results.mapId, mapId))
      .orderBy(desc(ResultStatuses.score));
  }),

  createResult: protectedProcedure.input(CreateResultSchema).mutation(async ({ input, ctx }) => {
    const { user } = ctx;
    const userId = user.id;
    const { mapId, lineResults, status } = input;

    return db.transaction(async (tx) => {
      const existingResult = await tx
        .select({ id: Results.id })
        .from(Results)
        .where(and(eq(Results.userId, userId), eq(Results.mapId, mapId)))
        .limit(1)
        .then((rows) => rows[0]);

      let resultId: number | undefined;

      if (existingResult) {
        resultId = await tx
          .update(Results)
          .set({ updatedAt: new Date() })
          .where(eq(Results.id, existingResult.id))
          .returning({ id: Results.id })
          .then((res) => res[0]?.id);
      } else {
        const maxId = await tx
          .select({ maxId: max(Results.id) })
          .from(Results)
          .then((rows) => rows[0]?.maxId ?? 0);

        const nextId = maxId + 1;

        resultId = await tx
          .insert(Results)
          .values({ id: nextId, mapId, userId })
          .returning({ id: Results.id })
          .then((res) => res[0]?.id);
      }
      if (!resultId) {
        throw new TRPCError({ code: "PRECONDITION_FAILED" });
      }

      await tx
        .insert(ResultStatuses)
        .values({ resultId, ...status })
        .onConflictDoUpdate({ target: [ResultStatuses.resultId], set: status });

      const jsonString = JSON.stringify(lineResults, null, 2);

      await uploadPublicFile({
        key: `result-json/${resultId}.json`,
        body: jsonString,
        contentType: "application/json",
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
    });
  }),
} satisfies TRPCRouterRecord;

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
      notificationId: NotificationOverTakes.notificationId,
      visitorId: NotificationOverTakes.visitorId,
      visitorScore: ResultStatuses.score,
    })
    .from(NotificationOverTakes)
    .innerJoin(Notifications, eq(Notifications.id, NotificationOverTakes.notificationId))
    .innerJoin(
      Results,
      and(eq(Results.userId, NotificationOverTakes.visitorId), eq(Results.mapId, NotificationOverTakes.mapId)),
    )
    .innerJoin(ResultStatuses, eq(ResultStatuses.resultId, Results.id))
    .where(
      and(
        eq(NotificationOverTakes.visitedId, userId),
        eq(NotificationOverTakes.mapId, mapId),
        eq(Notifications.type, "OVER_TAKE"),
      ),
    );

  // 自分の最新スコア以下の訪問者の通知IDを取得
  const notificationIdsToDelete = overtakeNotifications
    .filter((notification) => notification.visitorScore <= myResult.score)
    .map((notification) => notification.notificationId);

  if (notificationIdsToDelete.length > 0) {
    // Notificationsを削除すると、NotificationOverTakesもカスケード削除される
    await tx.delete(Notifications).where(inArray(Notifications.id, notificationIdsToDelete));
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
  for (const [index, rankedUser] of rankedUsers.entries()) {
    const nextRank = index + 1;
    const prevRank = rankedUser.rank;

    await tx
      .update(Results)
      .set({ rank: nextRank })
      .where(and(eq(Results.mapId, mapId), eq(Results.userId, rankedUser.userId)));

    const isOtherUser = rankedUser.userId !== userId;
    if (isOtherUser && prevRank <= 5 && prevRank !== nextRank) {
      const { userId: recipientId } = rankedUser;

      const existingNotificationId = await tx
        .select({ notificationId: NotificationOverTakes.notificationId })
        .from(NotificationOverTakes)
        .where(
          and(
            eq(NotificationOverTakes.visitorId, userId),
            eq(NotificationOverTakes.visitedId, recipientId),
            eq(NotificationOverTakes.mapId, mapId),
          ),
        )
        .limit(1)
        .then((res) => res[0]?.notificationId ?? null);

      if (existingNotificationId) {
        await tx
          .update(Notifications)
          .set({ checked: false, updatedAt: new Date() })
          .where(eq(Notifications.id, existingNotificationId));

        await tx
          .update(NotificationOverTakes)
          .set({ prevRank })
          .where(eq(NotificationOverTakes.notificationId, existingNotificationId));
      } else {
        const notificationId = nanoid(10);

        await tx.insert(Notifications).values({
          id: notificationId,
          recipientId,
          type: "OVER_TAKE",
        });

        await tx.insert(NotificationOverTakes).values({
          notificationId,
          visitorId: userId,
          visitedId: recipientId,
          mapId,
          prevRank,
        });
      }
    }
  }
};

function generateModeFilter({ mode }: { mode: (typeof RESULT_INPUT_METHOD_TYPES)[number] | null }) {
  switch (mode) {
    case "roma":
      return [gt(ResultStatuses.romaType, 0), eq(ResultStatuses.kanaType, 0)];
    case "kana":
      return [gt(ResultStatuses.kanaType, 0), eq(ResultStatuses.romaType, 0)];
    case "romakana":
      return [gt(ResultStatuses.kanaType, 0), gt(ResultStatuses.romaType, 0)];
    case "english":
      return [eq(ResultStatuses.kanaType, 0), eq(ResultStatuses.romaType, 0), gt(ResultStatuses.englishType, 0)];
    default:
      return [];
  }
}

function generateKpmFilter({ minKpm, maxKpm }: { minKpm: number; maxKpm: number }) {
  const conds: SQL<unknown>[] = [];
  if (minKpm > KPM_LIMIT.min) {
    conds.push(gte(ResultStatuses.kanaToRomaKpm, minKpm));
  }
  if (KPM_LIMIT.max > maxKpm) {
    conds.push(lte(ResultStatuses.kanaToRomaKpm, maxKpm));
  }
  return conds;
}

function generateClearRateFilter({ minClearRate, maxClearRate }: { minClearRate: number; maxClearRate: number }) {
  const conds: SQL<unknown>[] = [];
  if (minClearRate > CLEAR_RATE_LIMIT.min) {
    conds.push(gte(ResultStatuses.clearRate, minClearRate));
  }
  if (CLEAR_RATE_LIMIT.max > maxClearRate) {
    conds.push(lte(ResultStatuses.clearRate, maxClearRate));
  }

  return conds;
}

function generatePlaySpeedFilter({ minPlaySpeed, maxPlaySpeed }: { minPlaySpeed: number; maxPlaySpeed: number }) {
  const conds: SQL<unknown>[] = [];
  if (minPlaySpeed > PLAY_SPEED_LIMIT.min) {
    conds.push(gte(ResultStatuses.minPlaySpeed, minPlaySpeed));
  }

  if (PLAY_SPEED_LIMIT.max > maxPlaySpeed) {
    conds.push(lte(ResultStatuses.minPlaySpeed, maxPlaySpeed));
  }

  return conds;
}

function generateKeywordFilter({
  username,
  mapKeyword,
  PlayerName,
  CreatorName,
}: {
  username: string;
  mapKeyword: string;
  PlayerName: BuildAliasTable<typeof Users, "Player">["name"];
  CreatorName: BuildAliasTable<typeof Users, "Creator">["name"];
}) {
  const conds: SQL<unknown>[] = [];

  if (username !== "") {
    const pattern = `%${username}%`;
    conds.push(ilike(PlayerName, pattern));
  }

  if (mapKeyword !== "") {
    const pattern = `%${mapKeyword}%`;
    const keywordOr: SQL<unknown> = or(
      ilike(Maps.title, pattern),
      ilike(Maps.artistName, pattern),
      ilike(Maps.musicSource, pattern),
      ilike(CreatorName, pattern),
    ) as unknown as SQL<unknown>;
    conds.push(keywordOr);
  }

  return conds;
}
