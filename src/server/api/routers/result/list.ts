import type { TRPCRouterRecord } from "@trpc/server";
import type { SQL } from "drizzle-orm";
import { and, desc, eq, gt, gte, ilike, lte, or, sql } from "drizzle-orm";
import { alias, type PgSelect, type SelectedFields } from "drizzle-orm/pg-core";
import type { SelectResultFields } from "drizzle-orm/query-builders/select.types";
import z from "zod";
import { MapDifficulties, MapLikes, Maps, ResultClaps, ResultStatuses, Results, Users } from "@/server/drizzle/schema";
import type { RESULT_INPUT_METHOD_TYPES, ResultListSearchFilterSchema } from "@/validator/result";
import {
  CLEAR_RATE_LIMIT,
  KPM_LIMIT,
  PLAY_SPEED_LIMIT,
  SelectResultListApiSchema,
  SelectResultListByPlayerIdApiSchema,
} from "@/validator/result";
import { publicProcedure, type TRPCContext } from "../../trpc";
import { createPagination } from "../../utils/pagination";
import type { MapListItem } from "../map/list";

const Player = alias(Users, "Player");
const Creator = alias(Users, "Creator");
const MyResult = alias(Results, "MyResult");

const PAGE_SIZE = 25;

export const resultListRouter = {
  getWithMap: publicProcedure.input(SelectResultListApiSchema).query(async ({ input, ctx }) => {
    const { db, user } = ctx;

    const { limit, offset, buildPageResult } = createPagination(input?.cursor, PAGE_SIZE);
    const baseSelect = getBaseSelect();

    const items = await buildResultWithMapBaseQuery(db.select(baseSelect).from(Results).$dynamic(), user, input)
      .orderBy(desc(Results.updatedAt))
      .limit(limit)
      .offset(offset);

    return buildPageResult(formatMapListItem(items));
  }),

  getWithMapByUserId: publicProcedure.input(SelectResultListByPlayerIdApiSchema).query(async ({ input, ctx }) => {
    const { db, user } = ctx;
    const { playerId } = input;
    const { limit, offset, buildPageResult } = createPagination(input?.cursor, PAGE_SIZE);
    const baseSelect = getBaseSelect();

    const items = await buildResultWithMapBaseQuery(db.select(baseSelect).from(Results).$dynamic(), user)
      .where(eq(Results.userId, playerId))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(Results.updatedAt));

    return buildPageResult(formatMapListItem(items));
  }),

  getMapRanking: publicProcedure.input(z.object({ mapId: z.number() })).query(async ({ input, ctx }) => {
    const { db, user } = ctx;
    const { mapId } = input;

    const Player = alias(Users, "Player");

    const { map: _, ...resultSelect } = getBaseSelect();

    return db
      .select(resultSelect)
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
} satisfies TRPCRouterRecord;

const getBaseSelect = () =>
  ({
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
      isCaseSensitive: ResultStatuses.isCaseSensitive,
    },
    typeSpeed: {
      kpm: ResultStatuses.kpm,
      rkpm: ResultStatuses.rkpm,
      kanaToRomaKpm: ResultStatuses.kanaToRomaKpm,
      kanaToRomaRkpm: ResultStatuses.kanaToRomaRkpm,
    },
    clap: { count: Results.clapCount, hasClapped: sql`COALESCE(${ResultClaps.hasClapped}, false)`.mapWith(Boolean) },
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
      duration: Maps.duration,
      romaKpmMedian: MapDifficulties.romaKpmMedian,
      romaKpmMax: MapDifficulties.romaKpmMax,
      hasLiked: sql`COALESCE(${MapLikes.hasLiked}, false)`.mapWith(Boolean),
      myRank: sql`${MyResult.rank}`.mapWith(MyResult.rank),
      myRankUpdatedAt: sql`${MyResult.updatedAt}`.mapWith(Results.updatedAt),
    },
  }) satisfies SelectedFields;

type ResultWithMapBaseItem = SelectResultFields<ReturnType<typeof getBaseSelect>>;

export type ResultWithMapItem = ReturnType<typeof formatMapListItem>[number];

const buildResultWithMapBaseQuery = <T extends PgSelect>(
  db: T,
  user: TRPCContext["user"],
  input?: z.output<typeof ResultListSearchFilterSchema>,
) => {
  const baseQuery = db
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

  if (!input) return baseQuery;

  const whereConds = [
    buildModeFilter({ mode: input.mode }),
    buildKpmFilter({ minKpm: input.minKpm, maxKpm: input.maxKpm }),
    buildClearRateFilter({ minClearRate: input.minClearRate, maxClearRate: input.maxClearRate }),
    buildPlaySpeedFilter({ minPlaySpeed: input.minPlaySpeed, maxPlaySpeed: input.maxPlaySpeed }),
    buildKeywordFilter({ username: input.username, mapKeyword: input.mapKeyword }),
  ];

  return baseQuery.where(and(...whereConds));
};

const formatMapListItem = (items: ResultWithMapBaseItem[]) => {
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

const buildModeFilter = ({ mode }: { mode: (typeof RESULT_INPUT_METHOD_TYPES)[number] | null }) => {
  switch (mode) {
    case "roma":
      return and(gt(ResultStatuses.romaType, 0), eq(ResultStatuses.kanaType, 0));
    case "kana":
      return and(gt(ResultStatuses.kanaType, 0), eq(ResultStatuses.romaType, 0));
    case "romakana":
      return and(gt(ResultStatuses.kanaType, 0), gt(ResultStatuses.romaType, 0));
    case "english":
      return and(eq(ResultStatuses.kanaType, 0), eq(ResultStatuses.romaType, 0), gt(ResultStatuses.englishType, 0));
    default:
      return undefined;
  }
};

const buildKpmFilter = ({ minKpm, maxKpm }: { minKpm: number; maxKpm: number }) => {
  const conditions: SQL<unknown>[] = [];
  if (minKpm > KPM_LIMIT.min) {
    conditions.push(gte(ResultStatuses.kanaToRomaKpm, minKpm));
  }
  if (KPM_LIMIT.max > maxKpm) {
    conditions.push(lte(ResultStatuses.kanaToRomaKpm, maxKpm));
  }
  return and(...conditions);
};

const buildClearRateFilter = ({ minClearRate, maxClearRate }: { minClearRate: number; maxClearRate: number }) => {
  const conditions: SQL<unknown>[] = [];
  if (minClearRate > CLEAR_RATE_LIMIT.min) {
    conditions.push(gte(ResultStatuses.clearRate, minClearRate));
  }
  if (CLEAR_RATE_LIMIT.max > maxClearRate) {
    conditions.push(lte(ResultStatuses.clearRate, maxClearRate));
  }

  return and(...conditions);
};

const buildPlaySpeedFilter = ({ minPlaySpeed, maxPlaySpeed }: { minPlaySpeed: number; maxPlaySpeed: number }) => {
  const conditions: SQL<unknown>[] = [];
  if (minPlaySpeed > PLAY_SPEED_LIMIT.min) {
    conditions.push(gte(ResultStatuses.minPlaySpeed, minPlaySpeed));
  }

  if (PLAY_SPEED_LIMIT.max > maxPlaySpeed) {
    conditions.push(lte(ResultStatuses.minPlaySpeed, maxPlaySpeed));
  }

  return and(...conditions);
};

const buildKeywordFilter = ({ username, mapKeyword }: { username: string; mapKeyword: string }) => {
  const conditions = [];

  if (username !== "") {
    const pattern = `%${username}%`;
    conditions.push(ilike(Player.name, pattern));
  }

  if (mapKeyword !== "") {
    const pattern = `%${mapKeyword}%`;
    const keywordOr = or(
      ilike(Maps.title, pattern),
      ilike(Maps.artistName, pattern),
      ilike(Maps.musicSource, pattern),
      ilike(Creator.name, pattern),
    );

    conditions.push(keywordOr);
  }

  return and(...conditions);
};
