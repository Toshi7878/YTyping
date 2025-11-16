import type { TRPCRouterRecord } from "@trpc/server";
import { and, asc, count, desc, eq, gte, ilike, isNotNull, isNull, lte, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import z from "zod";
import { db } from "@/server/drizzle/client";
import { MapDifficulties, MapLikes, Maps, ResultStatuses, Results, Users } from "@/server/drizzle/schema";
import {
  MAP_DIFFICULTY_RATE_FILTER_LIMIT,
  type MAP_USER_FILTER_OPTIONS,
  MapFilterSearchParamsSchema,
  type MapSortSearchParamsSchema,
  SelectMapListApiSchema,
  SelectMapListByActiveUserApiSchema,
  SelectMapListByUserIdApiSchema,
} from "@/validator/map-list";
import { protectedProcedure, publicProcedure, type TRPCContext } from "../trpc";
import { createCursorPager } from "../utils/cursor-pager";

const createBaseSelect = ({ user }: { user: TRPCContext["user"] }) => {
  return db
    .select({
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
        id: Users.id,
        name: Users.name,
      },
      difficulty: {
        romaKpmMedian: MapDifficulties.romaKpmMedian,
        romaKpmMax: MapDifficulties.romaKpmMax,
      },
      like: {
        count: Maps.likeCount,
        hasLiked: sql<boolean>`COALESCE(${MapLikes.hasLiked}, false)`,
      },
      ranking: {
        count: Maps.rankingCount,
        myRank: Results.rank,
        myRankUpdatedAt: Results.updatedAt,
      },
    })
    .from(Maps)
    .innerJoin(MapDifficulties, eq(MapDifficulties.mapId, Maps.id))
    .innerJoin(Users, eq(Users.id, Maps.creatorId))
    .leftJoin(MapLikes, and(eq(MapLikes.mapId, Maps.id), eq(MapLikes.userId, user?.id ?? 0)))
    .leftJoin(Results, and(eq(Results.mapId, Maps.id), eq(Results.userId, user?.id ?? 0)))
    .leftJoin(ResultStatuses, eq(ResultStatuses.resultId, Results.id));
};

type BaseSelectItem = Awaited<ReturnType<typeof createBaseSelect>>[number];

export type MapListItem = Omit<BaseSelectItem, "media"> & {
  media: BaseSelectItem["media"] & {
    previewSpeed?: number;
  };
};

const PAGE_SIZE = 30;
const mapListRoute = {
  get: publicProcedure.input(SelectMapListApiSchema).query(async ({ input, ctx }) => {
    const { user } = ctx;

    const { parse, paginate } = createCursorPager(PAGE_SIZE);
    const { page, offset } = parse(input.cursor);
    const whereConds = [
      user ? generateFilterSql(input.filter, user) : undefined,
      user ? generateRankingStatusFilterSql(input.rankingStatus) : undefined,
      ...generateDifficultyFilterSql({ minRate: input.minRate, maxRate: input.maxRate }),
      generateKeywordFilterSql(input.keyword),
    ];

    const maps = await createBaseSelect({ user })
      .limit(PAGE_SIZE + 1)
      .orderBy(...generateSortSql(input.sort))
      .offset(offset)
      .where(whereConds.length ? and(...whereConds) : undefined);

    return paginate(maps, page);
  }),

  getByCreatorId: publicProcedure.input(SelectMapListByUserIdApiSchema).query(async ({ input, ctx }) => {
    const { sort, cursor, userId: creatorId } = input;
    const { user } = ctx;

    const { parse, paginate } = createCursorPager(PAGE_SIZE);
    const { page, offset } = parse(cursor);

    const maps = await createBaseSelect({ user })
      .limit(PAGE_SIZE + 1)
      .orderBy(...generateSortSql(sort))
      .offset(offset)
      .where(eq(Maps.creatorId, creatorId));

    return paginate(maps, page);
  }),

  getByLikedUserId: publicProcedure.input(SelectMapListByUserIdApiSchema).query(async ({ input, ctx }) => {
    const { sort, cursor, userId: likedUserId } = input;
    const { user } = ctx;

    const { parse, paginate } = createCursorPager(PAGE_SIZE);
    const { page, offset } = parse(cursor);
    const UserLikes = alias(MapLikes, "UserLikes");

    const maps = await createBaseSelect({ user })
      .innerJoin(UserLikes, and(eq(UserLikes.mapId, Maps.id), eq(UserLikes.userId, likedUserId)))
      .limit(PAGE_SIZE + 1)
      .orderBy(...generateSortSql(sort))
      .offset(offset)
      .where(and(eq(UserLikes.userId, likedUserId), eq(UserLikes.hasLiked, true)));

    return paginate(maps, page);
  }),

  getByVideoId: protectedProcedure.input(z.object({ videoId: z.string().length(11) })).query(async ({ input, ctx }) => {
    const { user } = ctx;
    const { videoId } = input;

    return createBaseSelect({ user }).where(eq(Maps.videoId, videoId)).orderBy(desc(Maps.id));
  }),

  getByActiveUser: protectedProcedure.input(SelectMapListByActiveUserApiSchema).query(async ({ input, ctx }) => {
    const { user } = ctx;

    const userListPromises = input.map(async (activeUser) => {
      if (activeUser.state === "type" && activeUser.mapId) {
        const map = await createBaseSelect({ user })
          .where(eq(Maps.id, activeUser.mapId))
          .then((rows) => rows[0]);

        return { ...activeUser, map };
      }

      return { ...activeUser, map: null };
    });

    const userList = await Promise.all(userListPromises);
    return userList;
  }),
} satisfies TRPCRouterRecord;

const mapListCountRoute = {
  getListLength: publicProcedure.input(MapFilterSearchParamsSchema).query(async ({ input, ctx }) => {
    const { db, user } = ctx;

    const whereConds = [
      user ? generateFilterSql(input.filter, user) : undefined,
      user ? generateRankingStatusFilterSql(input.rankingStatus) : undefined,
      ...generateDifficultyFilterSql({ minRate: input.minRate, maxRate: input.maxRate }),
      generateKeywordFilterSql(input.keyword),
    ];

    return db
      .select({ total: count() })
      .from(Maps)
      .innerJoin(MapDifficulties, eq(MapDifficulties.mapId, Maps.id))
      .innerJoin(Users, eq(Users.id, Maps.creatorId))
      .leftJoin(MapLikes, and(eq(MapLikes.mapId, Maps.id), eq(MapLikes.userId, user?.id ?? 0)))
      .leftJoin(Results, and(eq(Results.mapId, Maps.id), eq(Results.userId, user?.id ?? 0)))
      .leftJoin(ResultStatuses, eq(ResultStatuses.resultId, Results.id))
      .where(whereConds.length ? and(...whereConds) : undefined)
      .then((rows) => rows[0]?.total ?? 0);
  }),
} satisfies TRPCRouterRecord;

export const mapListRouter = {
  ...mapListRoute,
  ...mapListCountRoute,
} satisfies TRPCRouterRecord;

type MapListWhereParams = z.output<typeof MapFilterSearchParamsSchema>;

function generateFilterSql(
  filter: (typeof MAP_USER_FILTER_OPTIONS)[number] | null,
  user: NonNullable<TRPCContext["user"]>,
) {
  switch (filter) {
    case "liked": {
      return eq(MapLikes.hasLiked, true);
    }
    case "created":
      return eq(Maps.creatorId, user.id);
    default:
      return undefined;
  }
}

function generateSortSql(sort: z.output<typeof MapSortSearchParamsSchema> | null) {
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
      return [order(Results.updatedAt), order(Maps.id)];
    case "like-count":
      return [order(Maps.likeCount), order(Maps.id)];
    case "duration":
      return [order(Maps.duration)];
    case "like":
      return [order(MapLikes.createdAt)];
    default:
      return [desc(Maps.id)];
  }
}

interface GetDifficultyFilterSqlParams {
  minRate: MapListWhereParams["minRate"];
  maxRate: MapListWhereParams["maxRate"];
}

function generateDifficultyFilterSql({ minRate, maxRate }: GetDifficultyFilterSqlParams) {
  const conditions = [];

  if (minRate > MAP_DIFFICULTY_RATE_FILTER_LIMIT.min) {
    conditions.push(gte(MapDifficulties.romaKpmMedian, Math.round(minRate * 100)));
  }

  if (MAP_DIFFICULTY_RATE_FILTER_LIMIT.max > maxRate) {
    conditions.push(lte(MapDifficulties.romaKpmMedian, Math.round(maxRate * 100)));
  }

  return conditions;
}

function generateRankingStatusFilterSql(rankingStatus: MapListWhereParams["rankingStatus"]) {
  switch (rankingStatus) {
    case "registerd":
      return isNotNull(Results.id);
    case "unregisterd":
      return isNull(Results.id);
    case "1st":
      return eq(Results.rank, 1);
    case "not-first":
      return sql`${Results.rank} > 1`;
    case "perfect":
      return and(eq(ResultStatuses.miss, 0), eq(ResultStatuses.lost, 0));
    default:
      return;
  }
}

const generateKeywordFilterSql = (keyword: MapListWhereParams["keyword"]) => {
  if (keyword === undefined || keyword.trim() === "") return;

  const keywords = keyword.trim().split(/\s+/);

  const conditions = keywords.map((keyword) => {
    const pattern = `%${keyword}%`;
    return or(
      ilike(Maps.title, pattern),
      ilike(Maps.artistName, pattern),
      ilike(Maps.musicSource, pattern),
      sql`array_to_string(${Maps.tags}, ',') ilike ${pattern}`,
      ilike(Users.name, pattern),
    );
  });

  return and(...conditions);
};
