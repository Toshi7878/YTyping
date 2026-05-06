import type { TRPCRouterRecord } from "@trpc/server";
import { and, asc, count, desc, eq, gte, ilike, isNotNull, isNull, lte, or, type SQL, sql } from "drizzle-orm";
import { alias, type PgSelectQueryBuilder, type SelectedFields } from "drizzle-orm/pg-core";
import type { SelectResultFields } from "drizzle-orm/query-builders/select.types";
import z from "zod";
import type { DBType } from "@/server/drizzle/client";
import {
  mapBookmarkListItems,
  mapBookmarkLists,
  mapDifficulties,
  mapLikes,
  maps,
  resultStatuses,
  results,
  users,
} from "@/server/drizzle/schema";
import {
  type MAP_RANKING_STATUS_FILTER_OPTIONS,
  type MAP_USER_FILTER_OPTIONS,
  MapSearchFilterSchema,
  type mapSortSchema,
  SelectMapListApiSchema,
} from "@/validator/map/list";
import { bookmarkedMapExists } from "../../lib/map";
import { protectedProcedure, publicProcedure, type TRPCContext } from "../../trpc";
import { createPagination } from "../../utils/pagination";

const PAGE_SIZE = 30;
const creator = alias(users, "creator");
const liker = alias(mapLikes, "liker");
const myLike = alias(mapLikes, "my_like");
const myResult = alias(results, "my_result");
const myResultStatus = alias(resultStatuses, "my_result_status");

export const mapListRouter = {
  get: publicProcedure.input(SelectMapListApiSchema).query(async ({ input, ctx }) => {
    const { cursor, sort, ...searchInput } = input ?? {};
    const { db, session } = ctx;

    const { limit, offset, buildPageResult } = createPagination(cursor, PAGE_SIZE);

    const mapItems = await buildBaseQuery(
      db.select(buildBaseSelect(db, session)).from(maps).$dynamic(),
      session,
      searchInput,
    )
      .limit(limit)
      .offset(offset)
      .orderBy(...mapOrderBy(sort, searchInput));

    return buildPageResult(mapItems);
  }),

  getCount: publicProcedure.input(MapSearchFilterSchema).query(async ({ input, ctx }) => {
    const { db, session } = ctx;
    const baseQuery = buildBaseQuery(db.select({ count: count() }).from(maps).$dynamic(), session, input);
    const total = await baseQuery.limit(1);

    return total[0]?.count ?? 0;
  }),

  getByVideoId: protectedProcedure.input(z.object({ videoId: z.string().length(11) })).query(async ({ input, ctx }) => {
    const { db, session } = ctx;
    const { videoId } = input;

    return await buildBaseQuery(db.select(buildBaseSelect(db, session)).from(maps).$dynamic(), session)
      .where(eq(maps.videoId, videoId))
      .orderBy(desc(maps.id));
  }),

  getByTitle: protectedProcedure.input(z.object({ title: z.string() })).query(async ({ input, ctx }) => {
    const { db, session } = ctx;
    const { title } = input;

    return await buildBaseQuery(db.select(buildBaseSelect(db, session)).from(maps).$dynamic(), session)
      .where(eq(maps.title, title))
      .orderBy(desc(maps.id));
  }),

  getByMapId: protectedProcedure.input(z.object({ mapId: z.number() })).query(async ({ input, ctx }) => {
    const { db, session } = ctx;

    const map = await buildBaseQuery(db.select(buildBaseSelect(db, session)).from(maps).$dynamic(), session)
      .where(eq(maps.id, input.mapId))
      .limit(1)
      .then((rows) => rows[0]);

    return map;
  }),
} satisfies TRPCRouterRecord;

export type BaseSelectItem = SelectResultFields<ReturnType<typeof buildBaseSelect>>;

const buildBaseSelect = (db: DBType, session: TRPCContext["session"]) =>
  ({
    id: maps.id,
    updatedAt: maps.updatedAt,
    media: {
      videoId: maps.videoId,
      previewTime: maps.previewTime,
      thumbnailQuality: maps.thumbnailQuality,
    },
    info: {
      title: maps.title,
      artistName: maps.artistName,
      source: maps.musicSource,
      duration: maps.duration,
      categories: maps.category,
      visibility: maps.visibility,
    },
    creator: {
      id: creator.id,
      name: creator.name,
    },
    difficulty: {
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
    },
    bookmark: {
      hasBookmarked: session ? bookmarkedMapExists(db, session) : sql`false`.mapWith(Boolean),
    },
    like: {
      count: maps.likeCount,
      hasLiked: session ? sql`COALESCE(${myLike.hasLiked}, false)`.mapWith(Boolean) : sql`0`.mapWith(Boolean),
    },
    ranking: {
      count: maps.rankingCount,
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

const buildBaseQuery = <T extends PgSelectQueryBuilder>(
  db: T,
  session: TRPCContext["session"],
  input?: z.output<typeof MapSearchFilterSchema>,
) => {
  let baseQuery = db
    .innerJoin(mapDifficulties, eq(mapDifficulties.mapId, maps.id))
    .innerJoin(creator, eq(creator.id, maps.creatorId));

  if (session) {
    // @ts-expect-error
    baseQuery = baseQuery
      .leftJoin(myLike, and(eq(myLike.mapId, maps.id), eq(myLike.userId, session.user.id)))
      .leftJoin(myResult, and(eq(myResult.mapId, maps.id), eq(myResult.userId, session.user.id)));
  }

  if (!input) return baseQuery;

  /**
   * @see https://github.com/drizzle-team/drizzle-orm/issues/4232
   */
  if (input?.rankingStatus === "perfect") {
    // @ts-expect-error
    baseQuery = baseQuery.innerJoin(myResultStatus, eq(myResultStatus.resultId, myResult.id));
  }

  if (input?.likerId) {
    // @ts-expect-error
    baseQuery = baseQuery.innerJoin(liker, and(eq(liker.mapId, maps.id), eq(liker.userId, input.likerId)));
  }

  if (input?.bookmarkListId) {
    // @ts-expect-error
    baseQuery = baseQuery
      .innerJoin(
        mapBookmarkLists,
        and(
          eq(mapBookmarkLists.id, input.bookmarkListId),
          or(eq(mapBookmarkLists.isPublic, true), session ? eq(mapBookmarkLists.userId, session.user.id) : sql`false`),
        ),
      )
      .innerJoin(
        mapBookmarkListItems,
        and(eq(mapBookmarkListItems.listId, input.bookmarkListId), eq(mapBookmarkListItems.mapId, maps.id)),
      );
  }

  const searchFilters = [
    session ? filterByFilterType(input.filterType, session) : undefined,
    session ? filterByRankingStatus(input.rankingStatus) : undefined,
    filterByDifficulty({ minRate: input.minRate, maxRate: input.maxRate }),
    filterByKeyword(input.keyword),
    input ? filterByChunkCount(input) : undefined,
    input.creatorId ? eq(maps.creatorId, input.creatorId) : undefined,
    input.likerId ? and(eq(liker.userId, input.likerId), eq(liker.hasLiked, true)) : undefined,
    input.bookmarkListId
      ? and(eq(mapBookmarkLists.id, input.bookmarkListId), eq(mapBookmarkListItems.mapId, maps.id))
      : undefined,
  ];

  return baseQuery.where(and(filterByMapVisibility(session, input.filterType), ...searchFilters));
};

function filterByFilterType(
  filterType: (typeof MAP_USER_FILTER_OPTIONS)[number] | undefined | null,
  session: NonNullable<TRPCContext["session"]>,
) {
  switch (filterType) {
    case "liked": {
      return eq(myLike.hasLiked, true);
    }
    case "created":
      return eq(maps.creatorId, session.user.id);
    default:
      return undefined;
  }
}

function mapOrderBy(sort: z.output<typeof mapSortSchema>, searchInput: z.output<typeof MapSearchFilterSchema>) {
  const order = (sort.isDesc ?? true) ? desc : asc;

  switch (sort.type) {
    case "random":
      return [sql`RANDOM()`];

    case "difficulty":
      return [order(mapDifficulties.rating), order(maps.id)];
    case "ranking-count":
      return [order(maps.rankingCount), order(maps.id)];
    case "ranking-register":
      return [order(myResult.updatedAt), order(maps.id)];
    case "like-count":
      return [order(maps.likeCount), order(maps.id)];
    case "duration":
      return [order(maps.duration)];
    case "like":
      return [order(myLike.createdAt)];
    case "bookmark": {
      if (searchInput.bookmarkListId) {
        return [order(mapBookmarkListItems.createdAt)];
      }

      return [desc(maps.publishedAt)];
    }
    default:
      return [order(sql`COALESCE(${maps.publishedAt}, ${maps.createdAt})`), order(maps.id)];
  }
}

function filterByDifficulty({ minRate, maxRate }: { minRate?: number | null; maxRate?: number | null }) {
  const conditions: SQL[] = [];

  if (minRate) {
    conditions.push(gte(mapDifficulties.rating, minRate));
  }

  if (maxRate) {
    conditions.push(lte(mapDifficulties.rating, maxRate));
  }

  return and(...conditions);
}

const filterByRankingStatus = (
  rankingStatus: (typeof MAP_RANKING_STATUS_FILTER_OPTIONS)[number] | undefined | null,
) => {
  switch (rankingStatus) {
    case "registerd":
      return isNotNull(myResult.id);
    case "unregisterd":
      return isNull(myResult.id);
    case "1st":
      return eq(myResult.rank, 1);
    case "not-first":
      return sql`${myResult.rank} > 1`;
    case "perfect":
      return and(eq(myResultStatus.miss, 0), eq(myResultStatus.lost, 0));
    default:
      return;
  }
};

const filterByKeyword = (keyword?: string | null) => {
  if (!keyword || keyword.trim() === "") return;

  const keywords = keyword.trim().split(/\s+/);

  const conditions = keywords.map((keyword) => {
    const pattern = `%${keyword}%`;
    return or(
      ilike(maps.title, pattern),
      ilike(maps.artistName, pattern),
      ilike(maps.musicSource, pattern),
      sql`array_to_string(${maps.tags}, ',') ilike ${pattern}`,
      ilike(creator.name, pattern),
    );
  });

  return and(...conditions);
};

export const filterByMapVisibility = (
  session: TRPCContext["session"],
  inputFilter?: z.output<typeof MapSearchFilterSchema>["filterType"],
) => {
  if (!session) {
    return eq(maps.visibility, "PUBLIC");
  }

  if (inputFilter === "unlisted") {
    return and(eq(maps.visibility, "UNLISTED"), eq(maps.creatorId, session.user.id));
  }

  return or(eq(maps.visibility, "PUBLIC"), and(eq(maps.visibility, "UNLISTED"), eq(maps.creatorId, session.user.id)));
};

const filterByChunkCount = (
  input: Pick<z.output<typeof MapSearchFilterSchema>, "maxKanaChunkCount" | "minAlphabetChunkCount">,
) => {
  const conditions: SQL[] = [];
  const { maxKanaChunkCount, minAlphabetChunkCount } = input ?? {};

  if (typeof maxKanaChunkCount === "number" && maxKanaChunkCount >= 0) {
    conditions.push(lte(mapDifficulties.kanaChunkCount, maxKanaChunkCount));
  }

  if (typeof minAlphabetChunkCount === "number" && minAlphabetChunkCount >= 0) {
    conditions.push(gte(mapDifficulties.alphabetChunkCount, minAlphabetChunkCount));
  }

  return and(...conditions);
};
