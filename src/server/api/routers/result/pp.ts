import type { TRPCRouterRecord } from "@trpc/server";
import { and, count, desc, eq, sql } from "drizzle-orm";
import { alias, type PgSelect, type SelectedFields } from "drizzle-orm/pg-core";
import type { SelectResultFields } from "drizzle-orm/query-builders/select.types";
import type { DBType } from "@/server/drizzle/client";
import { MapDifficulties, MapLikes, Maps, ResultClaps, ResultStatuses, Results, Users } from "@/server/drizzle/schema";
import { SelectResultPpListApiSchema } from "@/validator/result";
import { TOTAL_PP_TOP_N } from "../../../../lib/pp";
import { bookmarkedMapExists } from "../../lib/map";
import { publicProcedure, type TRPCContext } from "../../trpc";
import { createPagination } from "../../utils/pagination";
import type { MapListItem } from "../map";

const Player = alias(Users, "player");
const Creator = alias(Users, "creator");
const MyResult = alias(Results, "my_result");
const MyLike = alias(MapLikes, "my_like");
const MyClap = alias(ResultClaps, "my_clap");

export const resultPpRouter = {
  userTopList: publicProcedure.input(SelectResultPpListApiSchema).query(async ({ input, ctx }) => {
    const { cursor, playerId, order } = input;
    const { db, session } = ctx;

    const PAGE_SIZE = 6;
    const page = cursor ?? 0;
    const pageOffset = page * PAGE_SIZE;
    const baseSelect = buildBaseSelect(db, session);

    const buildBase = () =>
      buildResultWithMapBaseQuery(db.select(baseSelect).from(Results).$dynamic(), session, playerId);

    if (order === "asc") {
      // TOP 200 の中の昇順: DESC で取得した上位 200 件を逆順ページングする
      const totalRaw = await buildResultWithMapBaseQuery(
        db.select({ count: count() }).from(Results).$dynamic(),
        session,
        playerId,
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

const buildResultWithMapBaseQuery = <T extends PgSelect>(db: T, session: TRPCContext["session"], playerId: number) => {
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

  return baseQuery.where(eq(Player.id, playerId));
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
