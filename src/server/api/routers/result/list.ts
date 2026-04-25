import type { TRPCRouterRecord } from "@trpc/server";
import type { SQL } from "drizzle-orm";
import { and, count, desc, eq, gt, gte, ilike, lte, or, sql } from "drizzle-orm";
import { alias, type PgSelect, type SelectedFields } from "drizzle-orm/pg-core";
import type { SelectResultFields } from "drizzle-orm/query-builders/select.types";
import z from "zod";
import type { DBType } from "@/server/drizzle/client";
import { MapDifficulties, MapLikes, Maps, ResultClaps, ResultStatuses, Results, Users } from "@/server/drizzle/schema";
import {
  CLEAR_RATE_LIMIT,
  KPM_LIMIT,
  PLAY_SPEED_LIMIT,
  type RESULT_INPUT_METHOD_TYPES,
  ResultListSearchFilterSchema,
  SelectResultListApiSchema,
  SelectResultPpListApiSchema,
} from "@/validator/result";
import { bookmarkedMapExists } from "../../lib/map";
import { publicProcedure, type TRPCContext } from "../../trpc";
import { createPagination } from "../../utils/pagination";
import type { MapListItem } from "../map";
import { filterByMapVisibility } from "../map/list";
import { TOTAL_PP_TOP_N } from "../result/pp";

const Player = alias(Users, "player");
const Creator = alias(Users, "creator");
const MyResult = alias(Results, "my_result");
const MyLike = alias(MapLikes, "my_like");
const MyClap = alias(ResultClaps, "my_clap");

const PAGE_SIZE = 25;

type ResultListMapVisibilityMode = "default" | "publicAndUnlisted";

const mapVisibilityForResultList = (session: TRPCContext["session"], mode: ResultListMapVisibilityMode) => {
  if (mode === "publicAndUnlisted") {
    return or(eq(Maps.visibility, "PUBLIC"), eq(Maps.visibility, "UNLISTED"));
  }
  return filterByMapVisibility(session);
};

export const resultListRouter = {
  get: publicProcedure.input(SelectResultListApiSchema).query(async ({ input, ctx }) => {
    const { cursor, ...searchInput } = input ?? {};
    const { db, session } = ctx;

    const { limit, offset, buildPageResult } = createPagination(cursor, PAGE_SIZE);
    const baseSelect = buildBaseSelect(db, session);

    const orderedQuery = buildResultWithMapBaseQuery(
      db.select(baseSelect).from(Results).$dynamic(),
      session,
      searchInput,
      "default",
    ).orderBy(desc(Results.updatedAt));

    const items = await orderedQuery.limit(limit).offset(offset);

    return buildPageResult(formatMapListItem(items));
  }),

  getPp: publicProcedure.input(SelectResultPpListApiSchema).query(async ({ input, ctx }) => {
    const { cursor, playerId, order } = input;
    const { db, session } = ctx;

    const PAGE_SIZE = 6;
    const page = cursor ?? 0;
    const pageOffset = page * PAGE_SIZE;
    const baseSelect = buildBaseSelect(db, session);

    const buildBase = () =>
      buildResultWithMapBaseQuery(
        db.select(baseSelect).from(Results).$dynamic(),
        session,
        { playerId },
        "publicAndUnlisted",
      );

    if (order === "asc") {
      // TOP 200 の中の昇順: DESC で取得した上位 200 件を逆順ページングする
      const totalRaw = await buildResultWithMapBaseQuery(
        db.select({ count: count() }).from(Results).$dynamic(),
        session,
        { playerId },
        "publicAndUnlisted",
      ).then((rows) => rows[0]?.count ?? 0);

      const total = Math.min(totalRaw, TOTAL_PP_TOP_N);
      const revOffset = Math.max(0, total - pageOffset - PAGE_SIZE);
      const revLimit = Math.min(PAGE_SIZE, total - pageOffset);

      if (revLimit <= 0) return { items: [], nextCursor: undefined };

      const items = await buildBase()
        .orderBy(desc(ResultStatuses.pp), desc(Results.updatedAt))
        .limit(revLimit)
        .offset(revOffset);

      return {
        items: formatMapListItem(items).reverse(),
        nextCursor: pageOffset + PAGE_SIZE < total ? page + 1 : undefined,
      };
    }

    // 降順（デフォルト）: 上位 TOTAL_PP_TOP_N 件まで
    const { limit, offset, buildPageResult } = createPagination(cursor, PAGE_SIZE, TOTAL_PP_TOP_N);

    const items = await buildBase()
      .orderBy(desc(ResultStatuses.pp), desc(Results.updatedAt))
      .limit(limit)
      .offset(offset);

    return buildPageResult(formatMapListItem(items));
  }),

  getCount: publicProcedure.input(ResultListSearchFilterSchema).query(async ({ input, ctx }) => {
    const { db, session } = ctx;

    const baseQuery = buildResultWithMapBaseQuery(
      db.select({ count: count() }).from(Results).$dynamic(),
      session,
      input,
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
      .from(Results)
      .innerJoin(ResultStatuses, eq(ResultStatuses.resultId, Results.id))
      .innerJoin(Player, eq(Player.id, Results.userId))
      .leftJoin(
        MyClap,
        session
          ? and(eq(MyClap.resultId, Results.id), eq(MyClap.userId, session.user.id))
          : eq(MyClap.resultId, Results.id),
      )
      .where(eq(Results.mapId, mapId))
      .orderBy(desc(ResultStatuses.score));
  }),
} satisfies TRPCRouterRecord;

const buildBaseSelect = (db: DBType, session: TRPCContext["session"]) =>
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
      pp: ResultStatuses.pp,
    },
    typeSpeed: {
      kpm: ResultStatuses.kpm,
      rkpm: ResultStatuses.rkpm,
      kanaToRomaKpm: ResultStatuses.kanaToRomaKpm,
      kanaToRomaRkpm: ResultStatuses.kanaToRomaRkpm,
    },
    clap: {
      count: Results.clapCount,
      hasClapped: session ? sql`COALESCE(${MyClap.hasClapped}, false)`.mapWith(Boolean) : sql`0`.mapWith(Boolean),
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
      visibility: Maps.visibility,
      updatedAt: Maps.updatedAt,
      creatorId: Creator.id,
      creatorName: Creator.name,
      duration: Maps.duration,
      romaKpmMedian: MapDifficulties.romaKpmMedian,
      kanaKpmMedian: MapDifficulties.kanaKpmMedian,
      romaKpmMax: MapDifficulties.romaKpmMax,
      kanaKpmMax: MapDifficulties.kanaKpmMax,
      romaTotalNotes: MapDifficulties.romaTotalNotes,
      kanaTotalNotes: MapDifficulties.kanaTotalNotes,
      rating: MapDifficulties.rating,
      categories: Maps.category,
      hasBookmarked: session ? bookmarkedMapExists(db, session) : sql`false`.mapWith(Boolean),
      hasLiked: session ? sql`COALESCE(${MyLike.hasLiked}, false)`.mapWith(Boolean) : sql`0`.mapWith(Boolean),
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

type ResultWithMapBaseItem = SelectResultFields<ReturnType<typeof buildBaseSelect>>;

export type ResultWithMapItem = ReturnType<typeof formatMapListItem>[number];

const buildResultWithMapBaseQuery = <T extends PgSelect>(
  db: T,
  session: TRPCContext["session"],
  input?: z.output<typeof ResultListSearchFilterSchema>,
  mapVisibilityMode: ResultListMapVisibilityMode = "default",
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
  if (session) {
    // @ts-expect-error
    baseQuery = baseQuery
      .leftJoin(MyLike, and(eq(MyLike.mapId, Maps.id), eq(MyLike.userId, session.user.id)))
      .leftJoin(MyResult, and(eq(MyResult.mapId, Maps.id), eq(MyResult.userId, session.user.id)))
      .leftJoin(MyClap, and(eq(MyClap.resultId, Results.id), eq(MyClap.userId, session.user.id)));
  }

  if (!input) return baseQuery;

  const whereConditions = [
    input.playerId ? eq(Player.id, input.playerId) : undefined,
    filterByInputMode({ mode: input.mode }),
    filterByKpm({ minKpm: input.minKpm, maxKpm: input.maxKpm }),
    filterByClearRate({ minClearRate: input.minClearRate, maxClearRate: input.maxClearRate }),
    filterByPlaySpeed({ minPlaySpeed: input.minPlaySpeed, maxPlaySpeed: input.maxPlaySpeed }),
    filterByKeyword({ username: input.username, mapKeyword: input.mapKeyword }),
  ];

  return baseQuery.where(and(mapVisibilityForResultList(session, mapVisibilityMode), ...whereConditions));
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

const filterByKpm = ({ minKpm, maxKpm }: { minKpm?: number | null; maxKpm?: number | null }) => {
  const conditions: SQL<unknown>[] = [];
  if (minKpm && minKpm > KPM_LIMIT.min) {
    conditions.push(gte(ResultStatuses.kanaToRomaKpm, minKpm));
  }
  if (maxKpm && KPM_LIMIT.max > maxKpm) {
    conditions.push(lte(ResultStatuses.kanaToRomaKpm, maxKpm));
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
    conditions.push(gte(ResultStatuses.clearRate, minClearRate));
  }
  if (maxClearRate && CLEAR_RATE_LIMIT.max > maxClearRate) {
    conditions.push(lte(ResultStatuses.clearRate, maxClearRate));
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
    conditions.push(gte(ResultStatuses.minPlaySpeed, minPlaySpeed));
  }

  if (maxPlaySpeed && PLAY_SPEED_LIMIT.max > maxPlaySpeed) {
    conditions.push(lte(ResultStatuses.minPlaySpeed, maxPlaySpeed));
  }

  return and(...conditions);
};

const filterByKeyword = ({ username, mapKeyword }: { username?: string | null; mapKeyword?: string | null }) => {
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
