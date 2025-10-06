import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import type { SQL } from "drizzle-orm";
import { and, count, desc, eq, gt, gte, ilike, inArray, lte, or, sql } from "drizzle-orm";
import { alias, type BuildAliasTable } from "drizzle-orm/pg-core";
import z from "zod";
import { DEFAULT_CLEAR_RATE_SEARCH_RANGE, DEFAULT_KPM_SEARCH_RANGE } from "@/app/timeline/_lib/const";
import type { TXType } from "@/server/drizzle/client";
import { db } from "@/server/drizzle/client";
import {
  MapDifficulties,
  MapLikes,
  Maps,
  Notifications,
  ResultClaps,
  ResultStatuses,
  Results,
  Users,
} from "@/server/drizzle/schema";
import type { ResultData } from "@/server/drizzle/validator/result";
import { CreateResultSchema } from "@/server/drizzle/validator/result";
import { downloadFile, upsertFile } from "@/utils/r2-storage";
import { type Context, protectedProcedure, publicProcedure } from "../trpc";
import { createCursorPager } from "../utils/cursor-pager";
import type { MapListItem } from "./map-list";

const InfiniteResultListBaseSchema = z.object({
  cursor: z.string().nullable().optional(),
});

const ResultSearchParamsSchema = z.object({
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
  user: Context["user"];
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
    hasLiked: MapLikes.hasLiked,
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
  getAllWithMap: publicProcedure
    .input(InfiniteResultListBaseSchema.extend(ResultSearchParamsSchema.shape))
    .query(async ({ input, ctx }) => {
      const { user } = ctx;

      const { parse, paginate } = createCursorPager(PAGE_SIZE);
      const { page, offset } = parse(input.cursor);

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
        .limit(PAGE_SIZE + 1)
        .offset(offset);

      return paginate(toMapListItem(items), page);
    }),

  getAllWithMapByUserId: publicProcedure
    .input(InfiniteResultListBaseSchema.extend({ playerId: z.number() }))
    .query(async ({ input, ctx }) => {
      const { user } = ctx;
      const { playerId } = input;
      const { parse, paginate } = createCursorPager(PAGE_SIZE);
      const { page, offset } = parse(input.cursor);

      const Player = alias(Users, "Player");
      const Creator = alias(Users, "Creator");

      const items = await createResultWithMapBaseSelect({ user, alias: { Player, Creator } })
        .where(eq(Results.userId, playerId))
        .orderBy(desc(Results.updatedAt))
        .limit(PAGE_SIZE + 1)
        .offset(offset);

      return paginate(toMapListItem(items), page);
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
    const data = await downloadFile({ key: `result-json/${input.resultId}.json` });

    if (!data) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Result data not found" });
    }

    const jsonString = new TextDecoder().decode(data);
    const jsonData: ResultData = JSON.parse(jsonString);

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
        .values({ resultId, ...status })
        .onConflictDoUpdate({ target: [ResultStatuses.resultId], set: status });

      const jsonString = JSON.stringify(lineResults, null, 2);
      await upsertFile({
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

      return true;
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
    .select({ visitorId: Notifications.visitorId, visitorScore: ResultStatuses.score })
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
          set: { checked: false, createdAt: new Date(), oldRank: previousRank ?? null },
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
    default:
      return [];
  }
}

function generateKpmFilter({ minKpm, maxKpm }: { minKpm: number; maxKpm: number }) {
  if (maxKpm === 0) return [];
  const conds: SQL<unknown>[] = [];
  if (typeof minKpm === "number") conds.push(gte(ResultStatuses.kanaToRomaKpm, minKpm));
  if (typeof maxKpm === "number") {
    if (maxKpm !== DEFAULT_KPM_SEARCH_RANGE.max) conds.push(lte(ResultStatuses.kanaToRomaKpm, maxKpm));
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
  if (typeof minPlaySpeed === "number") conds.push(gte(ResultStatuses.minPlaySpeed, minPlaySpeed));
  if (typeof maxPlaySpeed === "number") conds.push(lte(ResultStatuses.minPlaySpeed, maxPlaySpeed));
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

  if (username && username.trim() !== "") {
    const pattern = `%${username}%`;
    conds.push(ilike(PlayerName, pattern));
  }

  if (mapKeyword && mapKeyword.trim() !== "") {
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
