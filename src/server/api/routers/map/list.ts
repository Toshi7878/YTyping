import type { TRPCRouterRecord } from "@trpc/server";
import { and, asc, count, desc, eq, gte, ilike, isNotNull, isNull, lte, or, sql } from "drizzle-orm";
import { alias, type PgSelectQueryBuilder, type SelectedFields } from "drizzle-orm/pg-core";
import type { SelectResultFields } from "drizzle-orm/query-builders/select.types";
import z from "zod";
import type { DBType } from "@/server/drizzle/client";
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
  type MAP_RANKING_STATUS_FILTER_OPTIONS,
  type MAP_SORT_OPTIONS,
  type MAP_USER_FILTER_OPTIONS,
  MapSearchFilterSchema,
  SelectMapListApiSchema,
} from "@/validator/map/list";
import { bookmarkedMapExists } from "../../lib/map";
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
    const { cursor, sortType: sortValue, isSortDesc: sortDesc, ...searchInput } = input ?? {};
    const { db, session } = ctx;

    const { limit, offset, buildPageResult } = createPagination(cursor, PAGE_SIZE);

    const maps = await buildBaseQuery(
      db.select(buildBaseSelect(db, session)).from(Maps).$dynamic(),
      session,
      searchInput,
    )
      .limit(limit)
      .offset(offset)
      .orderBy(...mapOrderBy(sortValue, sortDesc, searchInput));

    return buildPageResult(maps);
  }),

  getCount: publicProcedure.input(MapSearchFilterSchema).query(async ({ input, ctx }) => {
    const { db, session } = ctx;
    const baseQuery = buildBaseQuery(db.select({ count: count() }).from(Maps).$dynamic(), session, input);
    const total = await baseQuery.limit(1);

    return total[0]?.count ?? 0;
  }),

  getByVideoId: protectedProcedure.input(z.object({ videoId: z.string().length(11) })).query(async ({ input, ctx }) => {
    const { db, session } = ctx;
    const { videoId } = input;

    return await buildBaseQuery(db.select(buildBaseSelect(db, session)).from(Maps).$dynamic(), session)
      .where(eq(Maps.videoId, videoId))
      .orderBy(desc(Maps.id));
  }),

  getByTitle: protectedProcedure.input(z.object({ title: z.string() })).query(async ({ input, ctx }) => {
    const { db, session } = ctx;
    const { title } = input;

    return await buildBaseQuery(db.select(buildBaseSelect(db, session)).from(Maps).$dynamic(), session)
      .where(eq(Maps.title, title))
      .orderBy(desc(Maps.id));
  }),

  getByMapId: protectedProcedure.input(z.object({ mapId: z.number() })).query(async ({ input, ctx }) => {
    const { db, session } = ctx;

    const map = await buildBaseQuery(db.select(buildBaseSelect(db, session)).from(Maps).$dynamic(), session)
      .where(eq(Maps.id, input.mapId))
      .limit(1)
      .then((rows) => rows[0]);

    return map;
  }),
} satisfies TRPCRouterRecord;

export type BaseSelectItem = SelectResultFields<ReturnType<typeof buildBaseSelect>>;

const buildBaseSelect = (db: DBType, session: TRPCContext["session"]) =>
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
      categories: Maps.category,
      visibility: Maps.visibility,
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
      kanaChunkCount: MapDifficulties.kanaChunkCount,
      alphabetChunkCount: MapDifficulties.alphabetChunkCount,
      numChunkCount: MapDifficulties.numChunkCount,
      spaceChunkCount: MapDifficulties.spaceChunkCount,
      symbolChunkCount: MapDifficulties.symbolChunkCount,
      rating: MapDifficulties.rating,
    },
    bookmark: {
      hasBookmarked: session ? bookmarkedMapExists(db, session) : sql`false`.mapWith(Boolean),
    },
    like: {
      count: Maps.likeCount,
      hasLiked: session ? sql`COALESCE(${MyLike.hasLiked}, false)`.mapWith(Boolean) : sql`0`.mapWith(Boolean),
    },
    ranking: {
      count: Maps.rankingCount,
      myRank: session ? sql<number | null>`${MyResult.rank}` : sql<null>`null`,
      myRankUpdatedAt: session
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
  session: TRPCContext["session"],
  input?: z.output<typeof MapSearchFilterSchema>,
) => {
  let baseQuery = db
    .innerJoin(MapDifficulties, eq(MapDifficulties.mapId, Maps.id))
    .innerJoin(Creator, eq(Creator.id, Maps.creatorId));

  if (session) {
    // @ts-expect-error
    baseQuery = baseQuery
      .leftJoin(MyLike, and(eq(MyLike.mapId, Maps.id), eq(MyLike.userId, session.user.id)))
      .leftJoin(MyResult, and(eq(MyResult.mapId, Maps.id), eq(MyResult.userId, session.user.id)));
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
      .innerJoin(
        MapBookmarkLists,
        and(
          eq(MapBookmarkLists.id, input.bookmarkListId),
          or(eq(MapBookmarkLists.isPublic, true), session ? eq(MapBookmarkLists.userId, session.user.id) : sql`false`),
        ),
      )
      .innerJoin(
        MapBookmarkListItems,
        and(eq(MapBookmarkListItems.listId, input.bookmarkListId), eq(MapBookmarkListItems.mapId, Maps.id)),
      );
  }

  const searchFilters = [
    session ? filterByFilterType(input.filterType, session) : undefined,
    session ? filterByRankingStatus(input.rankingStatus) : undefined,
    filterByDifficulty({ minRate: input.minRate, maxRate: input.maxRate }),
    filterByKeyword(input.keyword),
    input ? filterByChunkCount(input) : undefined,
    input.creatorId ? eq(Maps.creatorId, input.creatorId) : undefined,
    input.likerId ? and(eq(Liker.userId, input.likerId), eq(Liker.hasLiked, true)) : undefined,
    input.bookmarkListId
      ? and(eq(MapBookmarkLists.id, input.bookmarkListId), eq(MapBookmarkListItems.mapId, Maps.id))
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
      return eq(MyLike.hasLiked, true);
    }
    case "created":
      return eq(Maps.creatorId, session.user.id);
    default:
      return undefined;
  }
}

function mapOrderBy(
  sortField: (typeof MAP_SORT_OPTIONS)[number] | undefined | null,
  isDesc: boolean | undefined | null = true,
  searchInput: z.output<typeof MapSearchFilterSchema>,
) {
  const order = (isDesc ?? true) ? desc : asc;

  switch (sortField) {
    case "random":
      return [sql`RANDOM()`];

    case "difficulty":
      return [order(MapDifficulties.rating), order(Maps.id)];
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

      return [desc(Maps.publishedAt)];
    }
    default:
      return [order(sql`COALESCE(${Maps.publishedAt}, ${Maps.createdAt})`), order(Maps.id)];
  }
}

function filterByDifficulty({ minRate, maxRate }: { minRate?: number | null; maxRate?: number | null }) {
  const conditions = [];

  if (minRate) {
    conditions.push(gte(MapDifficulties.rating, minRate));
  }

  if (maxRate) {
    conditions.push(lte(MapDifficulties.rating, maxRate));
  }

  return and(...conditions);
}

const filterByRankingStatus = (
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

const filterByKeyword = (keyword?: string | null) => {
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

export const filterByMapVisibility = (
  session: TRPCContext["session"],
  inputFilter?: z.output<typeof MapSearchFilterSchema>["filterType"],
) => {
  if (!session) {
    return eq(Maps.visibility, "PUBLIC");
  }

  if (inputFilter === "unlisted") {
    return and(eq(Maps.visibility, "UNLISTED"), eq(Maps.creatorId, session.user.id));
  }

  return or(eq(Maps.visibility, "PUBLIC"), and(eq(Maps.visibility, "UNLISTED"), eq(Maps.creatorId, session.user.id)));
};

const filterByChunkCount = (
  input: Pick<z.output<typeof MapSearchFilterSchema>, "maxKanaChunkCount" | "minAlphabetChunkCount">,
) => {
  const conditions = [];
  const { maxKanaChunkCount, minAlphabetChunkCount } = input ?? {};

  if (typeof maxKanaChunkCount === "number" && maxKanaChunkCount >= 0) {
    conditions.push(lte(MapDifficulties.kanaChunkCount, maxKanaChunkCount));
  }

  if (typeof minAlphabetChunkCount === "number" && minAlphabetChunkCount >= 0) {
    conditions.push(gte(MapDifficulties.alphabetChunkCount, minAlphabetChunkCount));
  }

  return and(...conditions);
};
