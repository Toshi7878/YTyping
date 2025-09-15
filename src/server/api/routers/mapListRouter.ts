import { MapDifficulties, MapLikes, Maps, Results, ResultStatuses, Users } from "@/server/drizzle/schema";
import { and, asc, count, desc, eq, gte, ilike, isNotNull, isNull, lte, or, SQL, sql } from "drizzle-orm";
import z from "zod";
import { protectedProcedure, publicProcedure } from "../trpc";

const mapListSchema = z.object({
  cursor: z.string().nullable().optional(),
  filter: z.string().optional(),
  minRate: z.number().optional(),
  maxRate: z.number().optional(),
  played: z.string().optional(),
  keyword: z.string().default(""),
  sort: z.string().optional(),
});

const mapListLengthSchema = z.object({
  filter: z.string().optional(),
  minRate: z.number().optional(),
  maxRate: z.number().optional(),
  played: z.string().optional(),
  keyword: z.string().default(""),
});

const userStatusSchema = z.array(
  z.object({
    id: z.number(),
    name: z.string(),
    onlineAt: z.coerce.date(),
    state: z.string(),
    mapId: z.number().nullable(),
  }),
);

export const MAP_LIST_FIELDS = {
  id: Maps.id,
  videoId: Maps.videoId,
  title: Maps.title,
  artistName: Maps.artistName,
  musicSource: Maps.musicSource,
  previewTime: Maps.previewTime,
  thumbnailQuality: Maps.thumbnailQuality,
  likeCount: Maps.likeCount,
  rankingCount: Maps.rankingCount,
  totalTime: MapDifficulties.totalTime,
  creator: {
    id: Users.id,
    name: Users.name,
  },
  difficulty: {
    romaKpmMedian: MapDifficulties.romaKpmMedian,
    romaKpmMax: MapDifficulties.romaKpmMax,
  },
  hasLiked: MapLikes.isLiked,
  myRank: Results.rank,
  updatedAt: Maps.updatedAt,
};

export const mapListRouter = {
  getList: publicProcedure.input(mapListSchema).query(async ({ input, ctx }) => {
    const { db, user } = ctx;
    const userId = user?.id ? Number(user.id) : null;
    const PAGE_SIZE = 30;

    const page = input.cursor ? Number(input.cursor) : 0;
    const offset = isNaN(page) ? 0 : page * PAGE_SIZE;

    try {
      const whereConds = buildWhereConditions({
        filter: input.filter,
        minRate: input.minRate,
        maxRate: input.maxRate,
        played: input.played,
        keyword: input.keyword,
        userId,
      });
      const orderers = getSortSql({ sort: input.sort });

      const maps = await db
        .select(MAP_LIST_FIELDS)
        .from(Maps)
        .innerJoin(MapDifficulties, eq(MapDifficulties.mapId, Maps.id))
        .leftJoin(MapLikes, and(eq(MapLikes.mapId, Maps.id), eq(MapLikes.userId, user.id)))
        .leftJoin(Results, and(eq(Results.mapId, Maps.id), eq(Results.userId, user.id)))
        .innerJoin(Users, eq(Users.id, Maps.creatorId))
        .where(whereConds.length ? and(...whereConds) : undefined)
        .orderBy(...(orderers.length ? orderers : [desc(Maps.id)]))
        .limit(PAGE_SIZE + 1)
        .offset(offset);

      let nextCursor: string | undefined = undefined;
      if (maps.length > PAGE_SIZE) {
        maps.pop();
        nextCursor = String(isNaN(page) ? 1 : page + 1);
      }

      return { maps, nextCursor };
    } catch (error) {
      throw new Error("Failed to fetch map list");
    }
  }),
  getListLength: publicProcedure.input(mapListLengthSchema).query(async ({ input, ctx }) => {
    const { db, user } = ctx;
    const userId = user?.id ? Number(user.id) : null;

    const whereConds = buildWhereConditions({
      filter: input.filter,
      minRate: input.minRate,
      maxRate: input.maxRate,
      played: input.played,
      keyword: input.keyword,
      userId,
    });

    try {
      const totalCount = await db
        .select({ total: count() })
        .from(Maps)
        .innerJoin(MapDifficulties, eq(MapDifficulties.mapId, Maps.id))
        .leftJoin(MapLikes, and(eq(MapLikes.mapId, Maps.id), eq(MapLikes.userId, user.id)))
        .leftJoin(Results, and(eq(Results.mapId, Maps.id), eq(Results.userId, user.id)))
        .leftJoin(ResultStatuses, eq(ResultStatuses.resultId, Results.id))
        .innerJoin(Users, eq(Users.id, Maps.creatorId))
        .where(whereConds.length ? and(...whereConds) : undefined)
        .then((rows) => rows[0]?.total ?? 0);

      return totalCount;
    } catch (error) {
      throw new Error("Failed to fetch map list length");
    }
  }),
  getByVideoId: protectedProcedure.input(z.object({ videoId: z.string().length(11) })).query(async ({ input, ctx }) => {
    const { db, user } = ctx;
    const { videoId } = input;

    const rows = await db
      .select(MAP_LIST_FIELDS)
      .from(Maps)
      .innerJoin(Users, eq(Users.id, Maps.creatorId))
      .innerJoin(MapDifficulties, eq(MapDifficulties.mapId, Maps.id))
      .leftJoin(MapLikes, and(eq(MapLikes.mapId, Maps.id), eq(MapLikes.userId, user.id)))
      .leftJoin(Results, and(eq(Results.mapId, Maps.id), eq(Results.userId, user.id)))
      .where(eq(Maps.videoId, videoId))
      .orderBy(desc(Maps.id));

    return rows;
  }),

  getUserPlayingMaps: publicProcedure.input(userStatusSchema).query(async ({ input, ctx }) => {
    const { db, user } = ctx;

    const userListPromises = input.map(async (activeUser) => {
      if (activeUser.state === "type" && activeUser.mapId) {
        const map = await db
          .select(MAP_LIST_FIELDS)
          .from(Maps)
          .innerJoin(MapDifficulties, eq(MapDifficulties.mapId, Maps.id))
          .leftJoin(MapLikes, and(eq(MapLikes.mapId, Maps.id), eq(MapLikes.userId, user.id)))
          .leftJoin(Results, and(eq(Results.mapId, Maps.id), eq(Results.userId, user.id)))
          .innerJoin(Users, eq(Users.id, Maps.creatorId))
          .where(eq(Maps.id, activeUser.mapId))
          .then((rows) => rows[0]);

        return { ...activeUser, map };
      } else {
        return { ...activeUser, map: null };
      }
    });

    const userList = await Promise.all(userListPromises);
    return userList;
  }),
};

// Helper functions (移植元: where.ts)
interface GetFilterSql {
  filter: string | null | undefined;
  userId: number | null;
}

function getFilterSql({ filter, userId }: GetFilterSql) {
  switch (filter) {
    case "liked":
      if (!userId) return undefined;
      return eq(MapLikes.isLiked, true);
    case "my-map":
      if (!userId) return undefined;
      return eq(Maps.creatorId, userId);
    default:
      return undefined;
  }
}

interface GetSortSql {
  sort: string | null | undefined;
}

function getSortSql({ sort }: GetSortSql) {
  if (!sort) return [desc(Maps.id)];

  const isAsc = sort.includes("asc");

  switch (true) {
    case sort.includes("random"):
      return [sql`RANDOM()`];
    case sort.includes("id"):
      return [isAsc ? asc(Maps.id) : desc(Maps.id)];
    case sort.includes("difficulty"):
      return [isAsc ? asc(MapDifficulties.romaKpmMedian) : desc(MapDifficulties.romaKpmMedian)];
    case sort.includes("ranking_count"):
      return [isAsc ? asc(Maps.rankingCount) : desc(Maps.rankingCount), isAsc ? asc(Maps.id) : desc(Maps.id)];
    case sort.includes("like_count"):
      return [isAsc ? asc(Maps.likeCount) : desc(Maps.likeCount), isAsc ? asc(Maps.id) : desc(Maps.id)];
    case sort.includes("duration"):
      return [isAsc ? asc(MapDifficulties.totalTime) : desc(MapDifficulties.totalTime)];
    case sort.includes("like"):
      return [isAsc ? asc(MapLikes.createdAt) : desc(MapLikes.createdAt)];
    default:
      return [desc(Maps.id)];
  }
}

interface GetDifficultyFilterSql {
  minRate: number | null | undefined;
  maxRate: number | null | undefined;
}

const rateSchema = z.coerce.number().min(0).max(1200).optional();

function getDifficultyFilterSql({ minRate, maxRate }: GetDifficultyFilterSql) {
  const conditions: SQL<unknown>[] = [];

  const validMinRate = rateSchema.safeParse(minRate);
  const validMaxRate = rateSchema.safeParse(maxRate);

  if (validMinRate.success && validMinRate.data) {
    conditions.push(gte(MapDifficulties.romaKpmMedian, validMinRate.data * 100));
  }

  if (validMaxRate.success && validMaxRate.data) {
    conditions.push(lte(MapDifficulties.romaKpmMedian, validMaxRate.data * 100));
  }

  return conditions;
}

interface GetPlayedFilterSql {
  played: string | null | undefined;
  userId: number | null;
}

function getPlayedFilterSql({ played, userId }: GetPlayedFilterSql) {
  if (!userId) return undefined;

  switch (played) {
    case "played":
      return isNotNull(Results.id);
    case "unplayed":
      return isNull(Results.id);
    case "1st":
      return eq(Results.rank, 1);
    case "not-first":
      return sql`${Results.rank} > 1`;
    case "perfect":
      return and(eq(ResultStatuses.miss, 0), eq(ResultStatuses.lost, 0));
    default:
      return undefined;
  }
}

const generateKeywordFilterSql = ({ mapKeyword }: { mapKeyword: string }) => {
  if (!mapKeyword || mapKeyword.trim() === "") return undefined;
  const pattern = `%${mapKeyword}%`;
  return or(
    ilike(Maps.title, pattern),
    ilike(Maps.artistName, pattern),
    ilike(Maps.musicSource, pattern),
    ilike(Maps.tags, pattern),
    ilike(Users.name, pattern),
  );
};

function buildWhereConditions({
  filter,
  minRate,
  maxRate,
  played,
  keyword,
  userId,
}: {
  filter: string | undefined;
  minRate?: number;
  maxRate?: number;
  played?: string;
  keyword?: string;
  userId: number | null;
}) {
  const conditions: SQL<unknown>[] = [];
  const filterCond = getFilterSql({ filter, userId });
  if (filterCond) conditions.push(filterCond);
  const diffConds = getDifficultyFilterSql({ minRate, maxRate });
  conditions.push(...diffConds);
  const playedCond = getPlayedFilterSql({ played, userId });
  if (playedCond) conditions.push(playedCond);
  const keywordCond = generateKeywordFilterSql({ mapKeyword: keyword ?? "" });
  if (keywordCond) conditions.push(keywordCond);
  return conditions;
}
