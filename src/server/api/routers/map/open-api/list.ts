import type { TRPCRouterRecord } from "@trpc/server";
import { and, asc, desc, eq, gte, ilike, lte, or, sql } from "drizzle-orm";
import { alias, type PgSelectQueryBuilder, type SelectedFields } from "drizzle-orm/pg-core";
import type { OpenApiContentType } from "trpc-to-openapi";
import type z from "zod";
import {
  MapBookmarkListItems,
  MapBookmarkLists,
  MapDifficulties,
  MapLikes,
  Maps,
  Users,
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
const Creator = alias(Users, "creator");
const Liker = alias(MapLikes, "liker");

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

      const maps = await buildBaseQuery(db.select(buildBaseSelect()).from(Maps).$dynamic(), searchInput)
        .limit(limit)
        .offset(offset)
        .orderBy(...buildSortConditions(sortValue, sortDesc, searchInput));

      return buildPageResult(maps);
    }),
} satisfies TRPCRouterRecord;

const buildBaseSelect = () =>
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
    },
    like: {
      count: Maps.likeCount,
    },
    ranking: {
      count: Maps.rankingCount,
    },
  }) satisfies SelectedFields;

const buildBaseQuery = <T extends PgSelectQueryBuilder>(db: T, input?: z.output<typeof MapSearchFilterSchema>) => {
  let baseQuery = db
    .innerJoin(MapDifficulties, eq(MapDifficulties.mapId, Maps.id))
    .innerJoin(Creator, eq(Creator.id, Maps.creatorId));

  if (!input) return baseQuery;

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
    buildDifficultyCondition({ minRate: input.minRate, maxRate: input.maxRate }),
    buildKeywordCondition(input.keyword),
    input.creatorId ? eq(Maps.creatorId, input.creatorId) : undefined,
    input.likerId ? and(eq(Liker.userId, input.likerId), eq(Liker.hasLiked, true)) : undefined,
    input.bookmarkListId
      ? and(eq(MapBookmarkLists.id, input.bookmarkListId), eq(MapBookmarkListItems.mapId, Maps.id))
      : undefined,
  ];

  return baseQuery.where(and(eq(Maps.visibility, "PUBLIC"), ...searchConditions));
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
      return [order(MapDifficulties.romaKpmMedian)];
    case "ranking-count":
      return [order(Maps.rankingCount), order(Maps.id)];
    case "like-count":
      return [order(Maps.likeCount), order(Maps.id)];
    case "duration":
      return [order(Maps.duration)];
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

interface GetDifficultyFilterSqlParams {
  minRate?: number | null;
  maxRate?: number | null;
}

function buildDifficultyCondition({ minRate, maxRate }: GetDifficultyFilterSqlParams) {
  const conditions = [];

  if (minRate && minRate >= 0) {
    conditions.push(gte(MapDifficulties.romaKpmMedian, Math.round(minRate * 100)));
  }

  if (maxRate) {
    conditions.push(lte(MapDifficulties.romaKpmMedian, Math.round(maxRate * 100)));
  }

  return and(...conditions);
}

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
