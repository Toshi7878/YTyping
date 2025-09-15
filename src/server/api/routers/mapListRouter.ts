import { sql } from "drizzle-orm";
import { schema } from "@/server/drizzle/client";
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

export type MapItem = {
  is_liked: boolean;
  difficulty: {
    roma_kpm_median: number;
    roma_kpm_max: number;
    total_time: number;
  };
  id: number;
  video_id: string;
  title: string;
  artist_name: string;
  music_source: string;
  preview_time: string;
  like_count: number;
  ranking_count: number;
  thumbnail_quality: (typeof schema.thumbnailQualityEnum.enumValues)[number];
  updated_at: Date;
  creator: {
    id: number;
    name: string | null;
  };
  myRank: number | null;
};

export const mapListRouter = {
  getList: publicProcedure.input(mapListSchema).query(async ({ input, ctx }) => {
    const { db, user } = ctx;
    const userId = user?.id ? Number(user.id) : null;
    const PAGE_SIZE = 30;

    const page = input.cursor ? Number(input.cursor) : 0;
    const offset = isNaN(page) ? 0 : page * PAGE_SIZE;

    const filterSql = getFilterSql({ filter: input.filter, userId });
    const difficultyFilterSql = getDifficultyFilterSql({
      minRate: input.minRate,
      maxRate: input.maxRate,
    });
    const playedSql = getPlayedFilterSql({ played: input.played, userId });
    const keywordFilterSql = generateKeywordFilterSql({ mapKeyword: input.keyword });

    const whereConditions = [filterSql, difficultyFilterSql, keywordFilterSql, playedSql];
    const where = sql`${sql.join(whereConditions, sql` AND `)}`;
    const orderBy = getSortSql({ sort: input.sort });

    try {
      const items: MapItem[] = (await db.execute(sql`
        SELECT
        maps."id",
        maps."video_id",
        maps."title",
        maps."artist_name",
        maps."preview_time",
        maps."like_count",
        maps."ranking_count",
        maps."updated_at",
        maps."thumbnail_quality",
        maps."music_source",
        json_build_object(
          'id', creator."id",
          'name', creator."name"
        ) as "creator",
        json_build_object(
          'roma_kpm_median', "difficulty"."roma_kpm_median",
          'roma_kpm_max', "difficulty"."roma_kpm_max",
          'total_time', "difficulty"."total_time"
        ) as "difficulty",
        EXISTS (
          SELECT 1
          FROM map_likes ml
          WHERE ml."map_id" = maps."id"
          AND ml."user_id" = ${userId}
          AND ml."is_liked" = true
        ) as is_liked,
        (
          SELECT MIN(r."rank")::int
          FROM results r
          WHERE r."map_id" = maps."id"
          AND r."user_id" = ${userId}
        ) as "myRank"
        FROM maps
        JOIN users AS creator ON maps."creator_id" = creator."id"
        JOIN map_difficulties AS "difficulty" ON maps."id" = "difficulty"."map_id"
        LEFT JOIN map_likes ON maps."id" = map_likes."map_id" AND map_likes."user_id" = ${userId}
        WHERE ${where}
        ORDER BY ${orderBy}
        LIMIT ${PAGE_SIZE + 1}
        OFFSET ${offset}
      `)).rows as any;

      let nextCursor: string | undefined = undefined;
      if (items.length > PAGE_SIZE) {
        items.pop();
        nextCursor = String(isNaN(page) ? 1 : page + 1);
      }

      return {
        maps: items,
        nextCursor,
      };
    } catch (error) {
      throw new Error("Failed to fetch map list");
    }
  }),
  getListLength: publicProcedure.input(mapListLengthSchema).query(async ({ input, ctx }) => {
    const { db, user } = ctx;
    const userId = user?.id ? Number(user.id) : null;

    const filterSql = getFilterSql({ filter: input.filter, userId });
    const difficultyFilterSql = getDifficultyFilterSql({
      minRate: input.minRate,
      maxRate: input.maxRate,
    });
    const playedSql = getPlayedFilterSql({ played: input.played, userId });
    const keywordFilterSql = generateKeywordFilterSql({ mapKeyword: input.keyword });

    const whereConditions = [filterSql, difficultyFilterSql, keywordFilterSql, playedSql];
    const where = sql`${sql.join(whereConditions, sql` AND `)}`;

    try {
      const result = await db.execute(sql`
        SELECT COUNT(*) as total_count
        FROM maps
        JOIN users AS creator ON maps."creator_id" = creator."id"
        JOIN map_difficulties AS "difficulty" ON maps."id" = "difficulty"."map_id"
        LEFT JOIN map_likes ON maps."id" = map_likes."map_id" AND map_likes."user_id" = ${userId}
        WHERE ${where}
      `);

      const totalCount = (result as any)[0].total_count;
      return Number(totalCount);
    } catch (error) {
      throw new Error("Failed to fetch map list length");
    }
  }),
  getByVideoId: protectedProcedure.input(z.object({ videoId: z.string().length(11) })).query(async ({ input, ctx }) => {
    const { db, user } = ctx;
    const { videoId } = input;

    const rows = (await db.execute(sql`
      SELECT
        maps."id",
        maps."title",
        maps."artist_name",
        maps."music_source",
        maps."video_id",
        maps."updated_at",
        maps."preview_time",
        maps."thumbnail_quality",
        maps."like_count",
        maps."ranking_count",
        json_build_object(
          'roma_kpm_median', "difficulty"."roma_kpm_median",
          'roma_kpm_max', "difficulty"."roma_kpm_max",
          'total_time', "difficulty"."total_time"
        ) as "difficulty",
        json_build_object('id', creator."id", 'name', creator."name") as "creator",
        EXISTS (
          SELECT 1 FROM map_likes ml
          WHERE ml."map_id" = maps."id" AND ml."user_id" = ${user.id} AND ml."is_liked" = true
        ) as is_liked,
        (
          SELECT MIN(r."rank")::int FROM results r
          WHERE r."map_id" = maps."id" AND r."user_id" = ${user.id}
        ) as "myRank"
      FROM maps
      JOIN users AS creator ON maps."creator_id" = creator."id"
      LEFT JOIN map_difficulties AS "difficulty" ON maps."id" = "difficulty"."map_id"
      WHERE maps."video_id" = ${videoId}
      ORDER BY maps."id" DESC
    `)).rows as any[];

    const withDifficulty = rows.map((m) => ({
      ...m,
      difficulty: m.difficulty ?? { roma_kpm_median: 0, roma_kpm_max: 0, total_time: 0 },
    }));

    return withDifficulty as any;
  }),
};

// Helper functions (移植元: where.ts)
interface GetFilterSql {
  filter: string | null | undefined;
  userId: number | null;
}

function getFilterSql({ filter, userId }: GetFilterSql) {
  if (!userId) return sql.raw("1=1");

  switch (filter) {
    case "liked":
      return sql.raw(`map_likes."is_liked" = true`);
    case "my-map":
      return sql.raw(`creator."id" = ${userId}`);
    default:
      return sql.raw("1=1");
  }
}

interface GetSortSql {
  sort: string | null | undefined;
}

function getSortSql({ sort }: GetSortSql) {
  if (!sort) {
    return sql.raw(`maps."id" DESC`);
  }

  const isAsc = sort.includes("asc");

  switch (true) {
    case sort.includes("random"):
      return sql.raw(`RANDOM()`);
    case sort.includes("id"):
      if (isAsc) {
        return sql.raw(`maps."id" ASC`);
      } else {
        return sql.raw(`maps."id" DESC`);
      }
    case sort.includes("difficulty"):
      if (isAsc) {
        return sql.raw(`"difficulty"."roma_kpm_median" ASC`);
      } else {
        return sql.raw(`"difficulty"."roma_kpm_median" DESC`);
      }
    case sort.includes("ranking_count"):
      if (isAsc) {
        return sql.raw(`maps."ranking_count" ASC, maps."id" ASC`);
      } else {
        return sql.raw(`maps."ranking_count" DESC, maps."id" DESC`);
      }
    case sort.includes("like_count"):
      if (isAsc) {
        return sql.raw(`maps."like_count" ASC, maps."id" ASC`);
      } else {
        return sql.raw(`maps."like_count" DESC, maps."id" DESC`);
      }
    case sort.includes("duration"):
      if (isAsc) {
        return sql.raw(`"difficulty"."total_time" ASC`);
      } else {
        return sql.raw(`"difficulty"."total_time" DESC`);
      }
    case sort.includes("like"):
      if (isAsc) {
        return sql.raw(`"map_likes"."created_at" ASC`);
      } else {
        return sql.raw(`"map_likes"."created_at" DESC`);
      }
    default:
      return sql.raw(`maps."id" DESC`);
  }
}

interface GetDifficultyFilterSql {
  minRate: number | null | undefined;
  maxRate: number | null | undefined;
}

function getDifficultyFilterSql({ minRate, maxRate }: GetDifficultyFilterSql) {
  const conditions: string[] = [];

  if (minRate && !isNaN(Number(minRate))) {
    conditions.push(`"difficulty"."roma_kpm_median" >= ${Number(minRate) * 100}`);
  }

  if (maxRate && !isNaN(Number(maxRate))) {
    conditions.push(`"difficulty"."roma_kpm_median" <= ${Number(maxRate) * 100}`);
  }

  return conditions.length > 0 ? sql.raw(conditions.join(" AND ")) : sql.raw("1=1");
}

interface GetPlayedFilterSql {
  played: string | null | undefined;
  userId: number | null;
}

function getPlayedFilterSql({ played, userId }: GetPlayedFilterSql) {
  if (!userId) return sql.raw("1=1");

  switch (played) {
    case "played":
      return sql.raw(`EXISTS (
		  SELECT 1 FROM results
		  WHERE results.map_id = maps.id
		  AND results.user_id = ${userId}
		)`);
    case "unplayed":
      return sql.raw(`NOT EXISTS (
		  SELECT 1 FROM results
		  WHERE results.map_id = maps.id
		  AND results.user_id = ${userId}
		)`);
    case "1st":
      return sql.raw(`EXISTS (
		  SELECT 1 FROM results
		  WHERE results.map_id = maps.id
		  AND results.user_id = ${userId}
		  AND results.rank = 1
		)`);
    case "not-first":
      return sql.raw(`EXISTS (
		  SELECT 1 FROM results
		  JOIN result_statuses ON results.id = result_statuses.result_id
		  WHERE results.map_id = maps.id
		  AND results.user_id = ${userId}
		  AND results.rank > 1
		)`);
    case "perfect":
      return sql.raw(`EXISTS (
		  SELECT 1 FROM results
		  JOIN result_statuses ON results.id = result_statuses.result_id
		  WHERE results.map_id = maps.id
		  AND results.user_id = ${userId}
		  AND result_statuses.miss = 0
		  AND result_statuses.lost = 0
		)`);
    default:
      return sql.raw("1=1");
  }
}

const generateKeywordFilterSql = ({ mapKeyword }: { mapKeyword: string }) => {
  return mapKeyword !== ""
    ? sql`(
  maps."title" &@~ ${mapKeyword} OR
  maps."artist_name" &@~ ${mapKeyword} OR
  maps."music_source" &@~ ${mapKeyword} OR
  maps."tags" &@~ ${mapKeyword} OR
  creator."name" &@~ ${mapKeyword}
  )`
    : sql`TRUE`;
};
