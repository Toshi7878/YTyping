import type { TRPCRouterRecord } from "@trpc/server";
import type { SQL } from "drizzle-orm";
import { and, count, desc, eq, gt, gte, ilike, lte, or, sql } from "drizzle-orm";
import { alias, type PgSelect, type SelectedFields } from "drizzle-orm/pg-core";
import type { SelectResultFields } from "drizzle-orm/query-builders/select.types";
import z from "zod";
import { MapDifficulties, MapLikes, Maps, ResultClaps, ResultStatuses, Results, Users } from "@/server/drizzle/schema";
import type { RESULT_INPUT_METHOD_TYPES, ResultListSearchFilterSchema } from "@/validator/result";
import { CLEAR_RATE_LIMIT, KPM_LIMIT, PLAY_SPEED_LIMIT, SelectResultListApiSchema } from "@/validator/result";
import { buildHasBookmarkedMapExists } from "../../lib/map";
import { publicProcedure, type TRPCContext } from "../../trpc";
import { createPagination } from "../../utils/pagination";
import type { MapListItem } from "../map";

const Player = alias(Users, "player");
const Creator = alias(Users, "creator");
const MyResult = alias(Results, "my_result");
const MyLike = alias(MapLikes, "my_like");
const MyClap = alias(ResultClaps, "my_clap");

const PAGE_SIZE = 25;

export const resultListRouter = {
  getWithMap: publicProcedure.input(SelectResultListApiSchema).query(async ({ input, ctx }) => {
    const { cursor, ...searchInput } = input ?? {};
    const { db, user } = ctx;

    const { limit, offset, buildPageResult } = createPagination(cursor, PAGE_SIZE);
    const baseSelect = buildBaseSelect(user);

    const items = await buildResultWithMapBaseQuery(db.select(baseSelect).from(Results).$dynamic(), user, searchInput)
      .orderBy(desc(Results.updatedAt))
      .limit(limit)
      .offset(offset);

    return buildPageResult(formatMapListItem(items));
  }),

  getWithMapCount: publicProcedure.input(SelectResultListApiSchema).query(async ({ input, ctx }) => {
    const { cursor, ...searchInput } = input ?? {};
    const { db, user } = ctx;

    const baseQuery = buildResultWithMapBaseQuery(
      db.select({ count: count() }).from(Results).$dynamic(),
      user,
      searchInput,
    );

    const total = await baseQuery.limit(1);

    return total[0]?.count ?? 0;
  }),

  getMapRanking: publicProcedure.input(z.object({ mapId: z.number() })).query(async ({ input, ctx }) => {
    const { db, user } = ctx;
    const { mapId } = input;

    const Player = alias(Users, "player");

    const { map: _, ...resultSelect } = buildBaseSelect(user);

    return db
      .select(resultSelect)
      .from(Results)
      .innerJoin(ResultStatuses, eq(ResultStatuses.resultId, Results.id))
      .innerJoin(Player, eq(Player.id, Results.userId))
      .leftJoin(
        MyClap,
        user ? and(eq(MyClap.resultId, Results.id), eq(MyClap.userId, user.id)) : eq(MyClap.resultId, Results.id),
      )
      .where(eq(Results.mapId, mapId))
      .orderBy(desc(ResultStatuses.score));
  }),
} satisfies TRPCRouterRecord;

const buildBaseSelect = (user: TRPCContext["user"]) =>
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
    clap: {
      count: Results.clapCount,
      hasClapped: user ? sql`COALESCE(${MyClap.hasClapped}, false)`.mapWith(Boolean) : sql`0`.mapWith(Boolean),
    },
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
      hasBookmarked: user ? buildHasBookmarkedMapExists(user) : sql`false`.mapWith(Boolean),
      hasLiked: user ? sql`COALESCE(${MyLike.hasLiked}, false)`.mapWith(Boolean) : sql`0`.mapWith(Boolean),
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

type ResultWithMapBaseItem = SelectResultFields<ReturnType<typeof buildBaseSelect>>;

export type ResultWithMapItem = ReturnType<typeof formatMapListItem>[number];

const buildResultWithMapBaseQuery = <T extends PgSelect>(
  db: T,
  user: TRPCContext["user"],
  input?: z.output<typeof ResultListSearchFilterSchema>,
) => {
  let baseQuery = db
    .innerJoin(Maps, eq(Maps.id, Results.mapId))
    .innerJoin(ResultStatuses, eq(ResultStatuses.resultId, Results.id))
    .innerJoin(Creator, eq(Creator.id, Maps.creatorId))
    .innerJoin(Player, eq(Player.id, Results.userId))
    .innerJoin(MapDifficulties, eq(MapDifficulties.mapId, Maps.id));

  /**
   * @see https://github.com/drizzle-team/drizzle-orm/issues/4232
   */
  if (user) {
    // @ts-expect-error
    baseQuery = baseQuery
      .leftJoin(MyLike, and(eq(MyLike.mapId, Maps.id), eq(MyLike.userId, user.id)))
      .leftJoin(MyResult, and(eq(MyResult.mapId, Maps.id), eq(MyResult.userId, user.id)))
      .leftJoin(MyClap, and(eq(MyClap.resultId, Results.id), eq(MyClap.userId, user.id)));
  }

  if (!input) return baseQuery;

  const whereConditions = [
    input.playerId ? eq(Player.id, input.playerId) : undefined,
    buildModeFilter({ mode: input.mode }),
    buildKpmFilter({ minKpm: input.minKpm, maxKpm: input.maxKpm }),
    buildClearRateFilter({ minClearRate: input.minClearRate, maxClearRate: input.maxClearRate }),
    buildPlaySpeedFilter({ minPlaySpeed: input.minPlaySpeed, maxPlaySpeed: input.maxPlaySpeed }),
    buildKeywordFilter({ username: input.username, mapKeyword: input.mapKeyword }),
  ];

  return baseQuery.where(and(...whereConditions));
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
        bookmark: { hasBookmarked: m.hasBookmarked },
      } satisfies MapListItem,
    };
  });
};

const buildModeFilter = ({ mode }: { mode?: (typeof RESULT_INPUT_METHOD_TYPES)[number] | null }) => {
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

const buildKpmFilter = ({ minKpm, maxKpm }: { minKpm?: number | null; maxKpm?: number | null }) => {
  const conditions: SQL<unknown>[] = [];
  if (minKpm && minKpm > KPM_LIMIT.min) {
    conditions.push(gte(ResultStatuses.kanaToRomaKpm, minKpm));
  }
  if (maxKpm && KPM_LIMIT.max > maxKpm) {
    conditions.push(lte(ResultStatuses.kanaToRomaKpm, maxKpm));
  }
  return and(...conditions);
};

const buildClearRateFilter = ({
  minClearRate,
  maxClearRate,
}: {
  minClearRate?: number | null;
  maxClearRate?: number | null;
}) => {
  const conditions: SQL<unknown>[] = [];
  if (minClearRate && minClearRate > CLEAR_RATE_LIMIT.min) {
    conditions.push(gte(ResultStatuses.clearRate, minClearRate));
  }
  if (maxClearRate && CLEAR_RATE_LIMIT.max > maxClearRate) {
    conditions.push(lte(ResultStatuses.clearRate, maxClearRate));
  }

  return and(...conditions);
};

const buildPlaySpeedFilter = ({
  minPlaySpeed,
  maxPlaySpeed,
}: {
  minPlaySpeed?: number | null;
  maxPlaySpeed?: number | null;
}) => {
  const conditions: SQL<unknown>[] = [];
  if (minPlaySpeed && minPlaySpeed > PLAY_SPEED_LIMIT.min) {
    conditions.push(gte(ResultStatuses.minPlaySpeed, minPlaySpeed));
  }

  if (maxPlaySpeed && PLAY_SPEED_LIMIT.max > maxPlaySpeed) {
    conditions.push(lte(ResultStatuses.minPlaySpeed, maxPlaySpeed));
  }

  return and(...conditions);
};

const buildKeywordFilter = ({ username, mapKeyword }: { username?: string | null; mapKeyword?: string | null }) => {
  const conditions = [];

  if (username) {
    const pattern = `%${username}%`;
    conditions.push(ilike(Player.name, pattern));
  }

  if (mapKeyword) {
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
