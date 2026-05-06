import type { TRPCRouterRecord } from "@trpc/server";
import { and, count, desc, eq, sql } from "drizzle-orm";
import { alias, type PgSelect, type SelectedFields } from "drizzle-orm/pg-core";
import type { SelectResultFields } from "drizzle-orm/query-builders/select.types";
import type { DBType } from "@/server/drizzle/client";
import { mapDifficulties, mapLikes, maps, resultClaps, resultStatuses, results, users } from "@/server/drizzle/schema";
import { SelectResultPpListApiSchema } from "@/validator/result/pp";
import { TOTAL_PP_TOP_N } from "../../../../shared/result/pp/calc";
import { bookmarkedMapExists } from "../../lib/map";
import { protectedProcedure, publicProcedure, type TRPCContext } from "../../trpc";
import { createPagination } from "../../utils/pagination";
import type { MapListItem } from "../map";

const player = alias(users, "player");
const creator = alias(users, "creator");
const myResult = alias(results, "my_result");
const myLike = alias(mapLikes, "my_like");
const myClap = alias(resultClaps, "my_clap");

export const resultPpRouter = {
  getUserTopPps: protectedProcedure.query(async ({ ctx }) => {
    const { db, session } = ctx;

    return db
      .select({ mapId: results.mapId, pp: resultStatuses.pp })
      .from(results)
      .innerJoin(resultStatuses, eq(resultStatuses.resultId, results.id))
      .where(and(eq(results.userId, session.user.id), sql`${resultStatuses.pp} IS NOT NULL`))
      .orderBy(desc(resultStatuses.pp))
      .limit(TOTAL_PP_TOP_N);
  }),

  userTopList: publicProcedure.input(SelectResultPpListApiSchema).query(async ({ input, ctx }) => {
    const { cursor, playerId, order } = input;
    const { db, session } = ctx;

    const PAGE_SIZE = 6;
    const page = cursor ?? 0;
    const pageOffset = page * PAGE_SIZE;
    const baseSelect = buildBaseSelect(db, session);

    const buildBase = () =>
      buildResultWithMapBaseQuery(db.select(baseSelect).from(results).$dynamic(), session, playerId);

    if (order === "asc") {
      // TOP 200 の中の昇順: DESC で取得した上位 200 件を逆順ページングする
      const totalRaw = await buildResultWithMapBaseQuery(
        db.select({ count: count() }).from(results).$dynamic(),
        session,
        playerId,
      ).then((rows) => rows[0]?.count ?? 0);

      const total = Math.min(totalRaw, TOTAL_PP_TOP_N);
      const revOffset = Math.max(0, total - pageOffset - PAGE_SIZE);
      const revLimit = Math.min(PAGE_SIZE, total - pageOffset);

      if (revLimit <= 0) return { items: [], nextCursor: undefined };

      const items = await buildBase()
        .orderBy(desc(resultStatuses.pp), desc(results.updatedAt))
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
      .orderBy(desc(resultStatuses.pp), desc(results.updatedAt))
      .limit(limit)
      .offset(offset);

    return buildPageResult(formatMapListItem(items));
  }),
} satisfies TRPCRouterRecord;

const buildBaseSelect = (db: DBType, session: TRPCContext["session"]) =>
  ({
    id: results.id,
    updatedAt: results.updatedAt,
    rank: results.rank,
    score: resultStatuses.score,
    player: { id: player.id, name: player.name },
    typeCounts: {
      romaType: resultStatuses.romaType,
      kanaType: resultStatuses.kanaType,
      flickType: resultStatuses.flickType,
      englishType: resultStatuses.englishType,
      symbolType: resultStatuses.symbolType,
      spaceType: resultStatuses.spaceType,
      numType: resultStatuses.numType,
    },
    otherStatus: {
      playSpeed: resultStatuses.minPlaySpeed,
      miss: resultStatuses.miss,
      lost: resultStatuses.lost,
      maxCombo: resultStatuses.maxCombo,
      clearRate: resultStatuses.clearRate,
      isCaseSensitive: resultStatuses.isCaseSensitive,
      pp: resultStatuses.pp,
    },
    typeSpeed: {
      kpm: resultStatuses.kpm,
      rkpm: resultStatuses.rkpm,
      kanaToRomaKpm: resultStatuses.kanaToRomaKpm,
      kanaToRomaRkpm: resultStatuses.kanaToRomaRkpm,
    },
    clap: {
      count: results.clapCount,
      hasClapped: session ? sql`COALESCE(${myClap.hasClapped}, false)`.mapWith(Boolean) : sql`0`.mapWith(Boolean),
    },
    map: {
      id: maps.id,
      videoId: maps.videoId,
      title: maps.title,
      artistName: maps.artistName,
      musicSource: maps.musicSource,
      previewTime: maps.previewTime,
      thumbnailQuality: maps.thumbnailQuality,
      likeCount: maps.likeCount,
      rankingCount: maps.rankingCount,
      visibility: maps.visibility,
      updatedAt: maps.updatedAt,
      creatorId: creator.id,
      creatorName: creator.name,
      duration: maps.duration,
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
      categories: maps.category,
      hasBookmarked: session ? bookmarkedMapExists(db, session) : sql`false`.mapWith(Boolean),
      hasLiked: session ? sql`COALESCE(${myLike.hasLiked}, false)`.mapWith(Boolean) : sql`0`.mapWith(Boolean),
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

type ResultWithMapBaseItem = SelectResultFields<ReturnType<typeof buildBaseSelect>>;

const buildResultWithMapBaseQuery = <T extends PgSelect>(db: T, session: TRPCContext["session"], playerId: number) => {
  let baseQuery = db
    .innerJoin(maps, eq(maps.id, results.mapId))
    .innerJoin(resultStatuses, eq(resultStatuses.resultId, results.id))
    .innerJoin(creator, eq(creator.id, maps.creatorId))
    .innerJoin(player, eq(player.id, results.userId))
    .innerJoin(mapDifficulties, eq(mapDifficulties.mapId, maps.id));

  /**
   * @see https://github.com/drizzle-team/drizzle-orm/issues/4232
   */
  if (session) {
    // @ts-expect-error
    baseQuery = baseQuery
      .leftJoin(myLike, and(eq(myLike.mapId, maps.id), eq(myLike.userId, session.user.id)))
      .leftJoin(myResult, and(eq(myResult.mapId, maps.id), eq(myResult.userId, session.user.id)))
      .leftJoin(myClap, and(eq(myClap.resultId, results.id), eq(myClap.userId, session.user.id)));
  }

  return baseQuery.where(eq(player.id, playerId));
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
          kanaChunkCount: map.kanaChunkCount,
          alphabetChunkCount: map.alphabetChunkCount,
          numChunkCount: map.numChunkCount,
          spaceChunkCount: map.spaceChunkCount,
          symbolChunkCount: map.symbolChunkCount,
          rating: map.rating,
        },
        like: { count: map.likeCount, hasLiked: map.hasLiked },
        ranking: { count: map.rankingCount, myRank: map.myRank, myRankUpdatedAt: map.myRankUpdatedAt },
        bookmark: { hasBookmarked: map.hasBookmarked },
      } satisfies MapListItem,
    };
  });
};
