import type { TRPCRouterRecord } from "@trpc/server";
import { and, asc, desc, eq, gte, ilike, lte, or, sql } from "drizzle-orm";
import { alias, type PgSelectQueryBuilder, type SelectedFields } from "drizzle-orm/pg-core";
import type { OpenApiContentType } from "trpc-to-openapi";
import type z from "zod";
import {
  mapBookmarkListItems,
  mapBookmarkLists,
  mapDifficulties,
  mapLikes,
  maps,
  users,
} from "@/server/drizzle/schema";
import {
  GetMapListOpenApiResponseSchema,
  type MAP_SORT_OPTIONS_WITH_OPEN_API,
  type MapSearchFilterSchema,
  SelectMapListOpenApiSchema,
} from "@/validator/map/list";
import { OPENAPI_RATE_LIMITS } from "../../../lib/rate-limit-config";
import { createRateLimitMiddleware, publicProcedure } from "../../../trpc";
import { createPagination } from "../../../utils/pagination";

const PAGE_SIZE = 30;
const creator = alias(users, "creator");
const liker = alias(mapLikes, "liker");

export const mapListOpenApiRouter = {
  get: publicProcedure
    .use(createRateLimitMiddleware(OPENAPI_RATE_LIMITS["/maps"].get))
    .meta({
      openapi: {
        method: "GET",
        path: "/maps",
        protect: false,
        tags: ["Map"],
        summary: "Get map list",
        contentTypes: ["application/json" as OpenApiContentType],
        errorResponses: {
          400: "Invalid input data",
          429: "Too many requests",
          500: "Internal server error",
        },
      },
    })
    .input(SelectMapListOpenApiSchema)
    .output(GetMapListOpenApiResponseSchema)
    .query(async ({ input, ctx }) => {
      const { cursor, sortType: sortValue, isSortDesc: sortDesc, ...searchInput } = input ?? {};
      const { db } = ctx;

      const { limit, offset, buildPageResult } = createPagination(cursor, PAGE_SIZE);

      const mapRows = await buildBaseQuery(db.select(buildBaseSelect()).from(maps).$dynamic(), searchInput)
        .limit(limit)
        .offset(offset)
        .orderBy(...buildSortConditions(sortValue, sortDesc, searchInput));

      return buildPageResult(mapRows);
    }),
} satisfies TRPCRouterRecord;

const buildBaseSelect = () =>
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
    },
    like: {
      count: maps.likeCount,
    },
    ranking: {
      count: maps.rankingCount,
    },
  }) satisfies SelectedFields;

const buildBaseQuery = <T extends PgSelectQueryBuilder>(db: T, input?: z.output<typeof MapSearchFilterSchema>) => {
  let baseQuery = db
    .innerJoin(mapDifficulties, eq(mapDifficulties.mapId, maps.id))
    .innerJoin(creator, eq(creator.id, maps.creatorId));

  if (!input) return baseQuery;

  if (input?.likerId) {
    // @ts-expect-error
    baseQuery = baseQuery.innerJoin(liker, and(eq(liker.mapId, maps.id), eq(liker.userId, input.likerId)));
  }

  if (input?.bookmarkListId) {
    // @ts-expect-error
    baseQuery = baseQuery
      .innerJoin(mapBookmarkLists, and(eq(mapBookmarkLists.id, input.bookmarkListId)))
      .innerJoin(
        mapBookmarkListItems,
        and(eq(mapBookmarkListItems.listId, input.bookmarkListId), eq(mapBookmarkListItems.mapId, maps.id)),
      );
  }

  const searchConditions = [
    buildDifficultyCondition({ minRate: input.minRate, maxRate: input.maxRate }),
    buildKeywordCondition(input.keyword),
    input.creatorId ? eq(maps.creatorId, input.creatorId) : undefined,
    input.likerId ? and(eq(liker.userId, input.likerId), eq(liker.hasLiked, true)) : undefined,
    input.bookmarkListId
      ? and(eq(mapBookmarkLists.id, input.bookmarkListId), eq(mapBookmarkListItems.mapId, maps.id))
      : undefined,
  ];

  return baseQuery.where(and(eq(maps.visibility, "PUBLIC"), ...searchConditions));
};

function buildSortConditions(
  sortField: (typeof MAP_SORT_OPTIONS_WITH_OPEN_API)[number] | undefined | null,
  isDesc: boolean | undefined | null = true,
  searchInput: z.output<typeof MapSearchFilterSchema>,
) {
  const order = (isDesc ?? true) ? desc : asc;

  switch (sortField) {
    case "random":
      return [sql`RANDOM()`];

    case "difficulty":
      return [order(mapDifficulties.romaKpmMedian)];
    case "ranking-count":
      return [order(maps.rankingCount), order(maps.id)];
    case "like-count":
      return [order(maps.likeCount), order(maps.id)];
    case "duration":
      return [order(maps.duration)];
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

interface GetDifficultyFilterSqlParams {
  minRate?: number | null;
  maxRate?: number | null;
}

function buildDifficultyCondition({ minRate, maxRate }: GetDifficultyFilterSqlParams) {
  const conditions = [];

  if (minRate && minRate >= 0) {
    conditions.push(gte(mapDifficulties.romaKpmMedian, Math.round(minRate * 100)));
  }

  if (maxRate) {
    conditions.push(lte(mapDifficulties.romaKpmMedian, Math.round(maxRate * 100)));
  }

  return and(...conditions);
}

const buildKeywordCondition = (keyword?: string | null) => {
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
