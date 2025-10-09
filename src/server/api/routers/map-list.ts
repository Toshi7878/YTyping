import type { TRPCRouterRecord } from "@trpc/server";
import type { SQL } from "drizzle-orm";
import { and, asc, count, desc, eq, gte, ilike, isNotNull, isNull, lte, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import z from "zod";
import { db } from "@/server/drizzle/client";
import { MapDifficulties, MapLikes, Maps, ResultStatuses, Results, Users } from "@/server/drizzle/schema";
import { MapSearchParamsSchema, type SortFieldType } from "@/utils/queries/search-params/map-list";
import { type Context, protectedProcedure, publicProcedure } from "../trpc";
import { createCursorPager } from "../utils/cursor-pager";

const InfiniteMapListBaseSchema = z.object({
  cursor: z.string().nullable().optional(),
  sort: z
    .object({
      id: z.string(),
      desc: z.boolean(),
    })
    .nullable(),
});

const createBaseSelect = ({ user }: { user: Context["user"] }) => {
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
        hasLiked: MapLikes.hasLiked,
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
  getList: publicProcedure
    .input(InfiniteMapListBaseSchema.extend(MapSearchParamsSchema.shape))
    .query(async ({ input, ctx }) => {
      const { sort, cursor, ...filterParams } = input;
      const { user } = ctx;

      const { parse, paginate } = createCursorPager(PAGE_SIZE);
      const { page, offset } = parse(cursor);
      const whereConds = buildWhereConditions({ ...filterParams, user });
      const orderers = getSortSql({ sort });

      const maps = await createBaseSelect({ user })
        .limit(PAGE_SIZE + 1)
        .orderBy(...(orderers.length ? orderers : [desc(Maps.id)]))
        .offset(offset)
        .where(whereConds.length ? and(...whereConds) : undefined);

      return paginate(maps, page);
    }),

  getListByCreatorId: publicProcedure
    .input(InfiniteMapListBaseSchema.extend({ creatorId: z.number() }))
    .query(async ({ input, ctx }) => {
      const { sort, cursor, creatorId } = input;
      const { user } = ctx;

      const { parse, paginate } = createCursorPager(PAGE_SIZE);
      const { page, offset } = parse(cursor);
      const orderers = getSortSql({ sort });

      const maps = await createBaseSelect({ user })
        .limit(PAGE_SIZE + 1)
        .orderBy(...(orderers.length ? orderers : [desc(Maps.id)]))
        .offset(offset)
        .where(eq(Maps.creatorId, creatorId));

      return paginate(maps, page);
    }),

  getLikeListByUserId: publicProcedure
    .input(InfiniteMapListBaseSchema.extend({ likedUserId: z.number() }))
    .query(async ({ input, ctx }) => {
      const { sort, cursor, likedUserId } = input;
      const { user } = ctx;

      const { parse, paginate } = createCursorPager(PAGE_SIZE);
      const { page, offset } = parse(cursor);
      const orderers = getSortSql({ sort });
      const UserLikes = alias(MapLikes, "UserLikes");

      const maps = await createBaseSelect({ user })
        .innerJoin(UserLikes, and(eq(UserLikes.mapId, Maps.id), eq(UserLikes.userId, likedUserId)))
        .limit(PAGE_SIZE + 1)
        .orderBy(...(orderers.length ? orderers : [desc(Maps.id)]))
        .offset(offset)
        .where(and(eq(UserLikes.userId, likedUserId), eq(UserLikes.hasLiked, true)));

      return paginate(maps, page);
    }),

  getByVideoId: protectedProcedure.input(z.object({ videoId: z.string().length(11) })).query(async ({ input, ctx }) => {
    const { user } = ctx;
    const { videoId } = input;

    return createBaseSelect({ user }).where(eq(Maps.videoId, videoId)).orderBy(desc(Maps.id));
  }),

  getActiveUserPlayingMaps: protectedProcedure
    .input(
      z.array(
        z.object({
          id: z.number(),
          name: z.string(),
          onlineAt: z.coerce.date(),
          state: z.string(),
          mapId: z.number().nullable(),
        }),
      ),
    )
    .query(async ({ input, ctx }) => {
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
  getListLength: publicProcedure.input(MapSearchParamsSchema).query(async ({ input, ctx }) => {
    const { db, user } = ctx;

    const whereConds = buildWhereConditions({ ...input, user });

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

type MapListWhereParams = z.output<typeof MapSearchParamsSchema> & { user: Context["user"] };
interface GetFilterSqlParams {
  filter: MapListWhereParams["filter"];
  user: Context["user"];
  likedUserId?: number;
}

function getFilterSql({ filter, user }: GetFilterSqlParams) {
  if (!user) return;

  switch (filter) {
    case "liked": {
      return eq(MapLikes.hasLiked, true);
    }
    case "my-map":
      return eq(Maps.creatorId, user.id);
    default:
      return;
  }
}

interface GetSortSqlParams {
  sort: z.output<typeof InfiniteMapListBaseSchema.shape.sort>;
}

function getSortSql({ sort }: GetSortSqlParams) {
  if (!sort) return [desc(Maps.id)];

  const { id: sortField, desc: isDesc } = sort;
  const order = isDesc ? desc : asc;

  switch (sortField as SortFieldType) {
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

const rateSchema = z
  .preprocess((v) => (v == null ? v : Math.round(Number(v) * 100)), z.number().int().min(0).max(1200))
  .optional();

function getDifficultyFilterSql({ minRate, maxRate }: GetDifficultyFilterSqlParams) {
  const conditions: SQL<unknown>[] = [];

  const validMinRate = rateSchema.safeParse(minRate);
  const validMaxRate = rateSchema.safeParse(maxRate);

  if (validMinRate.success && validMinRate.data) {
    conditions.push(gte(MapDifficulties.romaKpmMedian, validMinRate.data));
  }

  if (validMaxRate.success && validMaxRate.data) {
    conditions.push(lte(MapDifficulties.romaKpmMedian, validMaxRate.data));
  }

  return conditions;
}

interface getRankingStatusFilterSqlParams {
  rankingStatus: MapListWhereParams["rankingStatus"];
  user: Context["user"];
}

function getRankingStatusFilterSql({ rankingStatus, user }: getRankingStatusFilterSqlParams) {
  if (!user) return;

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

const generateKeywordFilterSql = ({ keyword }: { keyword: MapListWhereParams["keyword"] }) => {
  if (keyword === undefined || keyword.trim() === "") return;
  const pattern = `%${keyword}%`;
  return or(
    ilike(Maps.title, pattern),
    ilike(Maps.artistName, pattern),
    ilike(Maps.musicSource, pattern),
    sql`array_to_string(${Maps.tags}, ',') ilike ${`%${keyword}%`}`,
    ilike(Users.name, pattern),
  );
};

function buildWhereConditions({ filter, minRate, maxRate, rankingStatus, keyword, user }: MapListWhereParams) {
  const conditions: SQL<unknown>[] = [];

  const filterCond = getFilterSql({ filter, user });
  if (filterCond) conditions.push(filterCond);
  const diffConds = getDifficultyFilterSql({ minRate, maxRate });
  conditions.push(...diffConds);
  const rankingStatusCond = getRankingStatusFilterSql({ rankingStatus, user });
  if (rankingStatusCond) conditions.push(rankingStatusCond);
  const keywordCond = generateKeywordFilterSql({ keyword });
  if (keywordCond) conditions.push(keywordCond);
  return conditions;
}
