import type { TRPCRouterRecord } from "@trpc/server";
import type { SQL } from "drizzle-orm";
import { and, count, desc, eq, gt, gte, ilike, lte, or, sql } from "drizzle-orm";
import { alias, type PgSelect, type SelectedFields } from "drizzle-orm/pg-core";
import type { SelectResultFields } from "drizzle-orm/query-builders/select.types";
import z from "zod";
import type { DBType } from "@/server/drizzle/client";
import {
  mapDifficulties,
  mapLikes,
  maps,
  resultClaps,
  resultStatuses,
  results,
  users as Users,
} from "@/server/drizzle/schema";
import {
  CLEAR_RATE_LIMIT,
  KPM_LIMIT,
  PLAY_SPEED_LIMIT,
  type RESULT_INPUT_METHOD_TYPES,
  type ResultListFilterSchema,
  SelectResultListApiSchema,
} from "@/validator/result/list";
import { bookmarkedMapExists } from "../../lib/map";
import { publicProcedure, type TRPCContext } from "../../trpc";
import { createPagination } from "../../utils/pagination";
import type { MapListItem } from "../map";
import { filterByMapVisibility } from "../map/list";

const player = alias(Users, "player");
const creator = alias(Users, "creator");
const myResult = alias(results, "my_result");
const myLike = alias(mapLikes, "my_like");
const myClap = alias(resultClaps, "my_clap");

const PAGE_SIZE = 25;

export const resultListRouter = {
  get: publicProcedure.input(SelectResultListApiSchema).query(async ({ input, ctx }) => {
    const { cursor, ...searchInput } = input ?? {};
    const { db, session } = ctx;

    const { limit, offset, buildPageResult } = createPagination(cursor, PAGE_SIZE);
    const baseSelect = buildBaseSelect(db, session);

    const items = await buildResultWithMapBaseQuery(
      db.select(baseSelect).from(results).$dynamic(),
      session,
      searchInput,
    )
      .orderBy(desc(results.updatedAt))
      .limit(limit)
      .offset(offset);

    return buildPageResult(formatMapListItem(items));
  }),

  getCount: publicProcedure.input(SelectResultListApiSchema).query(async ({ input, ctx }) => {
    const { cursor, ...searchInput } = input ?? {};
    const { db, session } = ctx;

    const baseQuery = buildResultWithMapBaseQuery(
      db.select({ count: count() }).from(results).$dynamic(),
      session,
      searchInput,
    );

    const total = await baseQuery.limit(1);

    return total[0]?.count ?? 0;
  }),

  getRanking: publicProcedure.input(z.object({ mapId: z.number() })).query(async ({ input, ctx }) => {
    const { db, session } = ctx;
    const { mapId } = input;

    const { map: _, ...resultSelect } = buildBaseSelect(db, session);

    return db
      .select(resultSelect)
      .from(results)
      .innerJoin(resultStatuses, eq(resultStatuses.resultId, results.id))
      .innerJoin(player, eq(player.id, results.userId))
      .leftJoin(
        myClap,
        session
          ? and(eq(myClap.resultId, results.id), eq(myClap.userId, session.user.id))
          : eq(myClap.resultId, results.id),
      )
      .where(eq(results.mapId, mapId))
      .orderBy(desc(resultStatuses.score));
  }),
} satisfies TRPCRouterRecord;

const buildBaseSelect = (db: DBType, session: TRPCContext["session"]) =>
  ({
    id: results.id,
    updatedAt: results.updatedAt,
    rank: results.rank,
    score: resultStatuses.score,
    player: { id: player.id, name: player.name },
    typeCounts: {
      romaType: resultStatuses.romaType,
      kanaType: resultStatuses.kanaType,
      flickType: resultStatuses.flickType,
      englishType: resultStatuses.englishType,
      symbolType: resultStatuses.symbolType,
      spaceType: resultStatuses.spaceType,
      numType: resultStatuses.numType,
    },
    otherStatus: {
      playSpeed: resultStatuses.minPlaySpeed,
      miss: resultStatuses.miss,
      lost: resultStatuses.lost,
      maxCombo: resultStatuses.maxCombo,
      clearRate: resultStatuses.clearRate,
      isCaseSensitive: resultStatuses.isCaseSensitive,
      pp: resultStatuses.pp,
    },
    typeSpeed: {
      kpm: resultStatuses.kpm,
      rkpm: resultStatuses.rkpm,
      kanaToRomaKpm: resultStatuses.kanaToRomaKpm,
      kanaToRomaRkpm: resultStatuses.kanaToRomaRkpm,
    },
    clap: {
      count: results.clapCount,
      hasClapped: session ? sql`COALESCE(${myClap.hasClapped}, false)`.mapWith(Boolean) : sql`0`.mapWith(Boolean),
    },
    map: {
      id: maps.id,
      videoId: maps.videoId,
      title: maps.title,
      artistName: maps.artistName,
      musicSource: maps.musicSource,
      previewTime: maps.previewTime,
      thumbnailQuality: maps.thumbnailQuality,
      likeCount: maps.likeCount,
      rankingCount: maps.rankingCount,
      visibility: maps.visibility,
      updatedAt: maps.updatedAt,
      creatorId: creator.id,
      creatorName: creator.name,
      duration: maps.duration,
      romaKpmMedian: mapDifficulties.romaKpmMedian,
      kanaKpmMedian: mapDifficulties.kanaKpmMedian,
      romaKpmMax: mapDifficulties.romaKpmMax,
      kanaKpmMax: mapDifficulties.kanaKpmMax,
      romaTotalNotes: mapDifficulties.romaTotalNotes,
      kanaTotalNotes: mapDifficulties.kanaTotalNotes,
      kanaChunkCount: mapDifficulties.kanaChunkCount,
      alphabetChunkCount: mapDifficulties.alphabetChunkCount,
      numChunkCount: mapDifficulties.numChunkCount,
      spaceChunkCount: mapDifficulties.spaceChunkCount,
      symbolChunkCount: mapDifficulties.symbolChunkCount,
      rating: mapDifficulties.rating,
      categories: maps.category,
      hasBookmarked: session ? bookmarkedMapExists(db, session) : sql`false`.mapWith(Boolean),
      hasLiked: session ? sql`COALESCE(${myLike.hasLiked}, false)`.mapWith(Boolean) : sql`0`.mapWith(Boolean),
      myRank: session ? sql<number | null>`${myResult.rank}` : sql<null>`null`,
      myRankUpdatedAt: session
        ? sql`${myResult.updatedAt}`.mapWith({
            mapFromDriverValue: (value) => {
              if (value === null) return null;
              return new Date(value);
            },
          })
        : sql<null>`null`,
    },
  }) satisfies SelectedFields;

type ResultWithMapBaseItem = SelectResultFields<ReturnType<typeof buildBaseSelect>>;

export type ResultWithMapItem = ReturnType<typeof formatMapListItem>[number];

const buildResultWithMapBaseQuery = <T extends PgSelect>(
  db: T,
  session: TRPCContext["session"],
  input?: z.output<typeof ResultListFilterSchema>,
) => {
  let baseQuery = db
    .innerJoin(maps, eq(maps.id, results.mapId))
    .innerJoin(resultStatuses, eq(resultStatuses.resultId, results.id))
    .innerJoin(creator, eq(creator.id, maps.creatorId))
    .innerJoin(player, eq(player.id, results.userId))
    .innerJoin(mapDifficulties, eq(mapDifficulties.mapId, maps.id));

  /**
   * @see https://github.com/drizzle-team/drizzle-orm/issues/4232
   */
  if (session) {
    // @ts-expect-error
    baseQuery = baseQuery
      .leftJoin(myLike, and(eq(myLike.mapId, maps.id), eq(myLike.userId, session.user.id)))
      .leftJoin(myResult, and(eq(myResult.mapId, maps.id), eq(myResult.userId, session.user.id)))
      .leftJoin(myClap, and(eq(myClap.resultId, results.id), eq(myClap.userId, session.user.id)));
  }

  if (!input) return baseQuery;

  const whereConditions = [
    input.playerId ? eq(player.id, input.playerId) : undefined,
    filterByInputMode({ mode: input.mode }),
    filterByKpm({ minKpm: input.minKpm, maxKpm: input.maxKpm }),
    filterByClearRate({ minClearRate: input.minClearRate, maxClearRate: input.maxClearRate }),
    filterByPlaySpeed({ minPlaySpeed: input.minPlaySpeed, maxPlaySpeed: input.maxPlaySpeed }),
    filterByKeyword({ username: input.username, mapKeyword: input.mapKeyword }),
  ];

  return baseQuery.where(and(filterByMapVisibility(session), ...whereConditions));
};

const formatMapListItem = (items: ResultWithMapBaseItem[]) => {
  return items.map(({ map, ...rest }) => {
    return {
      ...rest,
      map: {
        id: map.id,
        updatedAt: map.updatedAt,
        media: {
          videoId: map.videoId,
          previewTime: map.previewTime,
          thumbnailQuality: map.thumbnailQuality,
          previewSpeed: rest.otherStatus.playSpeed,
        },
        info: {
          title: map.title,
          artistName: map.artistName,
          source: map.musicSource,
          duration: map.duration,
          categories: map.categories,
          visibility: map.visibility,
        },
        creator: { id: map.creatorId, name: map.creatorName },
        difficulty: {
          romaKpmMedian: map.romaKpmMedian,
          kanaKpmMedian: map.kanaKpmMedian,
          romaKpmMax: map.romaKpmMax,
          kanaKpmMax: map.kanaKpmMax,
          romaTotalNotes: map.romaTotalNotes,
          kanaTotalNotes: map.kanaTotalNotes,
          kanaChunkCount: map.kanaChunkCount,
          alphabetChunkCount: map.alphabetChunkCount,
          numChunkCount: map.numChunkCount,
          spaceChunkCount: map.spaceChunkCount,
          symbolChunkCount: map.symbolChunkCount,
          rating: map.rating,
        },
        like: { count: map.likeCount, hasLiked: map.hasLiked },
        ranking: { count: map.rankingCount, myRank: map.myRank, myRankUpdatedAt: map.myRankUpdatedAt },
        bookmark: { hasBookmarked: map.hasBookmarked },
      } satisfies MapListItem,
    };
  });
};

const filterByInputMode = ({ mode }: { mode?: (typeof RESULT_INPUT_METHOD_TYPES)[number] | null }) => {
  switch (mode) {
    case "roma":
      return and(gt(resultStatuses.romaType, 0), eq(resultStatuses.kanaType, 0));
    case "kana":
      return and(gt(resultStatuses.kanaType, 0), eq(resultStatuses.romaType, 0));
    case "romakana":
      return and(gt(resultStatuses.kanaType, 0), gt(resultStatuses.romaType, 0));
    case "english":
      return and(eq(resultStatuses.kanaType, 0), eq(resultStatuses.romaType, 0), gt(resultStatuses.englishType, 0));
    default:
      return undefined;
  }
};

const filterByKpm = ({ minKpm, maxKpm }: { minKpm?: number | null; maxKpm?: number | null }) => {
  const conditions: SQL<unknown>[] = [];
  if (minKpm && minKpm > KPM_LIMIT.min) {
    conditions.push(gte(resultStatuses.kanaToRomaKpm, minKpm));
  }
  if (maxKpm && KPM_LIMIT.max > maxKpm) {
    conditions.push(lte(resultStatuses.kanaToRomaKpm, maxKpm));
  }
  return and(...conditions);
};

const filterByClearRate = ({
  minClearRate,
  maxClearRate,
}: {
  minClearRate?: number | null;
  maxClearRate?: number | null;
}) => {
  const conditions: SQL<unknown>[] = [];
  if (minClearRate && minClearRate > CLEAR_RATE_LIMIT.min) {
    conditions.push(gte(resultStatuses.clearRate, minClearRate));
  }
  if (maxClearRate && CLEAR_RATE_LIMIT.max > maxClearRate) {
    conditions.push(lte(resultStatuses.clearRate, maxClearRate));
  }

  return and(...conditions);
};

const filterByPlaySpeed = ({
  minPlaySpeed,
  maxPlaySpeed,
}: {
  minPlaySpeed?: number | null;
  maxPlaySpeed?: number | null;
}) => {
  const conditions: SQL<unknown>[] = [];
  if (minPlaySpeed && minPlaySpeed > PLAY_SPEED_LIMIT.min) {
    conditions.push(gte(resultStatuses.minPlaySpeed, minPlaySpeed));
  }

  if (maxPlaySpeed && PLAY_SPEED_LIMIT.max > maxPlaySpeed) {
    conditions.push(lte(resultStatuses.minPlaySpeed, maxPlaySpeed));
  }

  return and(...conditions);
};

const filterByKeyword = ({ username, mapKeyword }: { username?: string | null; mapKeyword?: string | null }) => {
  const conditions = [];

  if (username) {
    const pattern = `%${username}%`;
    conditions.push(ilike(player.name, pattern));
  }

  if (mapKeyword) {
    const pattern = `%${mapKeyword}%`;
    const keywordOr = or(
      ilike(maps.title, pattern),
      ilike(maps.artistName, pattern),
      ilike(maps.musicSource, pattern),
      ilike(creator.name, pattern),
    );

    conditions.push(keywordOr);
  }

  return and(...conditions);
};
