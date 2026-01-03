import type { TRPCRouterRecord } from "@trpc/server";
import { and, asc, count, desc, eq, gte, ilike, isNotNull, isNull, lte, or, sql } from "drizzle-orm";
import { alias, type PgSelectQueryBuilder, type SelectedFields } from "drizzle-orm/pg-core";
import type { SelectResultFields } from "drizzle-orm/query-builders/select.types";
import z from "zod";
import {
  MapBookmarkListItems,
  MapBookmarkLists,
  MapDifficulties,
  MapLikes,
  Maps,
  ResultStatuses,
  Results,
  Users,
} from "@/server/drizzle/schema";
import {
  MAP_DIFFICULTY_RATE_FILTER_LIMIT,
  type MAP_RANKING_STATUS_FILTER_OPTIONS,
  type MAP_USER_FILTER_OPTIONS,
  MapSearchFilterSchema,
  type MapSortSearchParamsSchema,
  SelectMapListApiSchema,
} from "@/validator/map-list";
import { buildHasBookmarkedMapExists } from "../../lib/map";
import { protectedProcedure, publicProcedure, type TRPCContext } from "../../trpc";
import { createPagination } from "../../utils/pagination";

const PAGE_SIZE = 30;
const Creator = alias(Users, "creator");
const Liker = alias(MapLikes, "liker");
const MyLike = alias(MapLikes, "my_like");
const MyResult = alias(Results, "my_result");
const MyResultStatus = alias(ResultStatuses, "my_result_status");

export const mapListRouter = {
  get: publicProcedure.input(SelectMapListApiSchema).query(async ({ input, ctx }) => {
    const { cursor, sort, ...searchInput } = input ?? {};
    const { db, user } = ctx;

    const { limit, offset, buildPageResult } = createPagination(cursor, PAGE_SIZE);

    const maps = await buildBaseQuery(db.select(buildBaseSelect(user)).from(Maps).$dynamic(), user, searchInput)
      .limit(limit)
      .offset(offset)
      .orderBy(...buildSortConditions(sort, searchInput));

    return buildPageResult(maps);
  }),

  getCount: publicProcedure.input(MapSearchFilterSchema).query(async ({ input, ctx }) => {
    const { db, user } = ctx;
    const baseQuery = buildBaseQuery(db.select({ count: count() }).from(Maps).$dynamic(), user, input);
    const total = await baseQuery.limit(1);

    return total[0]?.count ?? 0;
  }),

  getByVideoId: protectedProcedure.input(z.object({ videoId: z.string().length(11) })).query(async ({ input, ctx }) => {
    const { db, user } = ctx;
    const { videoId } = input;

    return await buildBaseQuery(db.select(buildBaseSelect(user)).from(Maps).$dynamic(), user)
      .where(eq(Maps.videoId, videoId))
      .orderBy(desc(Maps.id));
  }),

  getByMapId: protectedProcedure.input(z.object({ mapId: z.number() })).query(async ({ input, ctx }) => {
    const { db, user } = ctx;

    const map = await buildBaseQuery(db.select(buildBaseSelect(user)).from(Maps).$dynamic(), user)
      .where(eq(Maps.id, input.mapId))
      .limit(1)
      .then((rows) => rows[0]);

    return map;
  }),
} satisfies TRPCRouterRecord;

export type BaseSelectItem = SelectResultFields<ReturnType<typeof buildBaseSelect>>;

const buildBaseSelect = (user: TRPCContext["user"]) =>
  ({
    id: Maps.id,
    updatedAt: Maps.updatedAt,
    media: {
      videoId: Maps.videoId,
      previewTime: Maps.previewTime,
      thumbnailQuality: Maps.thumbnailQuality,
    },
    info: {
      title: Maps.title,
      artistName: Maps.artistName,
      source: Maps.musicSource,
      duration: Maps.duration,
    },
    creator: {
      id: Creator.id,
      name: Creator.name,
    },
    difficulty: {
      romaKpmMedian: MapDifficulties.romaKpmMedian,
      kanaKpmMedian: MapDifficulties.kanaKpmMedian,
      romaKpmMax: MapDifficulties.romaKpmMax,
      kanaKpmMax: MapDifficulties.kanaKpmMax,
      romaTotalNotes: MapDifficulties.romaTotalNotes,
      kanaTotalNotes: MapDifficulties.kanaTotalNotes,
    },
    bookmark: {
      hasBookmarked: user ? buildHasBookmarkedMapExists(user) : sql`false`.mapWith(Boolean),
    },
    like: {
      count: Maps.likeCount,
      hasLiked: user ? sql`COALESCE(${MyLike.hasLiked}, false)`.mapWith(Boolean) : sql`0`.mapWith(Boolean),
    },
    ranking: {
      count: Maps.rankingCount,
      myRank: user ? sql<number | null>`${MyResult.rank}` : sql<null>`null`,
      myRankUpdatedAt: user
        ? sql`${MyResult.updatedAt}`.mapWith({
            mapFromDriverValue: (value) => {
              if (value === null) return null;
              return new Date(value);
            },
          })
        : sql<null>`null`,
    },
  }) satisfies SelectedFields;

const buildBaseQuery = <T extends PgSelectQueryBuilder>(
  db: T,
  user: TRPCContext["user"],
  input?: z.output<typeof MapSearchFilterSchema>,
) => {
  let baseQuery = db
    .innerJoin(MapDifficulties, eq(MapDifficulties.mapId, Maps.id))
    .innerJoin(Creator, eq(Creator.id, Maps.creatorId));

  if (user) {
    // @ts-expect-error
    baseQuery = baseQuery
      .leftJoin(MyLike, and(eq(MyLike.mapId, Maps.id), eq(MyLike.userId, user.id)))
      .leftJoin(MyResult, and(eq(MyResult.mapId, Maps.id), eq(MyResult.userId, user.id)));
  }

  if (!input) return baseQuery;

  /**
   * @see https://github.com/drizzle-team/drizzle-orm/issues/4232
   */
  if (input?.rankingStatus === "perfect") {
    // @ts-expect-error
    baseQuery = baseQuery.innerJoin(MyResultStatus, eq(MyResultStatus.resultId, MyResult.id));
  }

  if (input?.likerId) {
    // @ts-expect-error
    baseQuery = baseQuery.innerJoin(Liker, and(eq(Liker.mapId, Maps.id), eq(Liker.userId, input.likerId)));
  }

  if (input?.bookmarkListId) {
    // @ts-expect-error
    baseQuery = baseQuery
      .innerJoin(MapBookmarkLists, and(eq(MapBookmarkLists.id, input.bookmarkListId)))
      .innerJoin(
        MapBookmarkListItems,
        and(eq(MapBookmarkListItems.listId, input.bookmarkListId), eq(MapBookmarkListItems.mapId, Maps.id)),
      );
  }

  const searchConditions = [
    user ? buildFilterCondition(input.filter, user) : undefined,
    user ? buildRankingStatusCondition(input.rankingStatus) : undefined,
    buildDifficultyCondition({ minRate: input.minRate, maxRate: input.maxRate }),
    buildKeywordCondition(input.keyword),
    input.creatorId ? eq(Maps.creatorId, input.creatorId) : undefined,
    input.likerId ? and(eq(Liker.userId, input.likerId), eq(Liker.hasLiked, true)) : undefined,
    input.bookmarkListId
      ? and(eq(MapBookmarkLists.id, input.bookmarkListId), eq(MapBookmarkListItems.mapId, Maps.id))
      : undefined,
  ];

  return baseQuery.where(and(...searchConditions));
};

function buildFilterCondition(
  filter: (typeof MAP_USER_FILTER_OPTIONS)[number] | undefined | null,
  user: NonNullable<TRPCContext["user"]>,
) {
  switch (filter) {
    case "liked": {
      return eq(MyLike.hasLiked, true);
    }
    case "created":
      return eq(Maps.creatorId, user.id);
    default:
      return undefined;
  }
}

function buildSortConditions(
  sort: z.output<typeof MapSortSearchParamsSchema>,
  searchInput: z.output<typeof MapSearchFilterSchema>,
) {
  if (!sort) return [desc(Maps.id)];

  const { value: sortField, desc: isDesc } = sort;
  const order = isDesc ? desc : asc;

  switch (sortField) {
    case "random":
      return [sql`RANDOM()`];
    case "id":
      return [order(Maps.id)];
    case "difficulty":
      return [order(MapDifficulties.romaKpmMedian)];
    case "ranking-count":
      return [order(Maps.rankingCount), order(Maps.id)];
    case "ranking-register":
      return [order(MyResult.updatedAt), order(Maps.id)];
    case "like-count":
      return [order(Maps.likeCount), order(Maps.id)];
    case "duration":
      return [order(Maps.duration)];
    case "like":
      return [order(MyLike.createdAt)];
    case "bookmark": {
      if (searchInput.bookmarkListId) {
        return [order(MapBookmarkListItems.createdAt)];
      }

      return [desc(Maps.id)];
    }

    default:
      return [desc(Maps.id)];
  }
}

interface GetDifficultyFilterSqlParams {
  minRate?: number | null;
  maxRate?: number | null;
}

function buildDifficultyCondition({ minRate, maxRate }: GetDifficultyFilterSqlParams) {
  const conditions = [];

  if (minRate && minRate > MAP_DIFFICULTY_RATE_FILTER_LIMIT.min) {
    conditions.push(gte(MapDifficulties.romaKpmMedian, Math.round(minRate * 100)));
  }

  if (maxRate && MAP_DIFFICULTY_RATE_FILTER_LIMIT.max > maxRate) {
    conditions.push(lte(MapDifficulties.romaKpmMedian, Math.round(maxRate * 100)));
  }

  return and(...conditions);
}

const buildRankingStatusCondition = (
  rankingStatus: (typeof MAP_RANKING_STATUS_FILTER_OPTIONS)[number] | undefined | null,
) => {
  switch (rankingStatus) {
    case "registerd":
      return isNotNull(MyResult.id);
    case "unregisterd":
      return isNull(MyResult.id);
    case "1st":
      return eq(MyResult.rank, 1);
    case "not-first":
      return sql`${MyResult.rank} > 1`;
    case "perfect":
      return and(eq(MyResultStatus.miss, 0), eq(MyResultStatus.lost, 0));
    default:
      return;
  }
};

const buildKeywordCondition = (keyword?: string | null) => {
  if (!keyword || keyword.trim() === "") return;

  const keywords = keyword.trim().split(/\s+/);

  const conditions = keywords.map((keyword) => {
    const pattern = `%${keyword}%`;
    return or(
      ilike(Maps.title, pattern),
      ilike(Maps.artistName, pattern),
      ilike(Maps.musicSource, pattern),
      sql`array_to_string(${Maps.tags}, ',') ilike ${pattern}`,
      ilike(Creator.name, pattern),
    );
  });

  return and(...conditions);
};
