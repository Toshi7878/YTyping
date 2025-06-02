import { PARAM_NAME } from "@/app/(home)/shared/const";
import { Prisma } from "@prisma/client";

interface GenerateMapListWhereParams {
  searchParams: URLSearchParams;
  userId: number;
}

export const generateMapListWhere = ({ searchParams, userId }: GenerateMapListWhereParams) => {
  const filterSql = getFilterSql({ filter: searchParams.get("filter"), userId });
  const difficultyFilterSql = getDifficultyFilterSql({
    minRate: searchParams.get(PARAM_NAME.minRate),
    maxRate: searchParams.get(PARAM_NAME.maxRate),
  });
  const playedSql = getPlayedFilterSql({ played: searchParams.get(PARAM_NAME.played), userId });
  const keywordFilterSql = generateKeywordFilterSql({ mapKeyword: searchParams.get(PARAM_NAME.keyword) ?? "" });

  return Prisma.sql`${Prisma.join([filterSql, difficultyFilterSql, keywordFilterSql, playedSql], ` AND `)}`;
};

interface GetFilterSql {
  filter: string | null;
  userId: number;
}

function getFilterSql({ filter, userId }: GetFilterSql) {
  switch (filter) {
    case "liked":
      return Prisma.raw(`map_likes."is_liked" = true`);
    case "my-map":
      return Prisma.raw(`creator."id" = ${userId}`);
    default:
      return Prisma.raw("1=1");
  }
}

interface GetSortSql {
  sort: string | null;
}
function getSortSql({ sort }: GetSortSql) {
  if (!sort) {
    return Prisma.raw(`maps."id" DESC`);
  }

  const isAsc = sort.includes("asc");

  switch (true) {
    case sort.includes("random"):
      return Prisma.raw(`RANDOM()`);
    case sort.includes("id"):
      if (isAsc) {
        return Prisma.raw(`maps."id" ASC`);
      } else {
        return Prisma.raw(`maps."id" DESC`);
      }
    case sort.includes("difficulty"):
      if (isAsc) {
        return Prisma.raw(`"difficulty"."roma_kpm_median" ASC`);
      } else {
        return Prisma.raw(`"difficulty"."roma_kpm_median" DESC`);
      }
    case sort.includes("ranking_count"):
      if (isAsc) {
        return Prisma.raw(`maps."ranking_count" ASC`);
      } else {
        return Prisma.raw(`maps."ranking_count" DESC`);
      }
    case sort.includes("like_count"):
      if (isAsc) {
        return Prisma.raw(`maps."like_count" ASC`);
      } else {
        return Prisma.raw(`maps."like_count" DESC`);
      }
    case sort.includes("duration"):
      if (isAsc) {
        return Prisma.raw(`"difficulty"."total_time" ASC`);
      } else {
        return Prisma.raw(`"difficulty"."total_time" DESC`);
      }
    case sort.includes("like"):
      if (isAsc) {
        return Prisma.raw(`"map_likes"."created_at" ASC`);
      } else {
        return Prisma.raw(`"map_likes"."created_at" DESC`);
      }
    default:
      return Prisma.raw(`maps."id" DESC`);
  }
}

interface GetDifficultyFilterSql {
  minRate: string | null;
  maxRate: string | null;
}

function getDifficultyFilterSql({ minRate, maxRate }: GetDifficultyFilterSql) {
  const conditions: string[] = [];

  if (minRate && !isNaN(Number(minRate))) {
    conditions.push(`"difficulty"."roma_kpm_median" >= ${Number(minRate) * 100}`);
  }

  if (maxRate && !isNaN(Number(maxRate))) {
    conditions.push(`"difficulty"."roma_kpm_median" <= ${Number(maxRate) * 100}`);
  }

  return conditions.length > 0 ? Prisma.raw(conditions.join(" AND ")) : Prisma.raw("1=1");
}

interface GetPlayedFilterSql {
  played: string | null;
  userId: number;
}

function getPlayedFilterSql({ played, userId }: GetPlayedFilterSql) {
  switch (played) {
    case "played":
      return Prisma.raw(`EXISTS (
		  SELECT 1 FROM results
		  WHERE results.map_id = maps.id
		  AND results.user_id = ${userId}
		)`);
    case "unplayed":
      return Prisma.raw(`NOT EXISTS (
		  SELECT 1 FROM results
		  WHERE results.map_id = maps.id
		  AND results.user_id = ${userId}
		)`);
    case "1st":
      return Prisma.raw(`EXISTS (
		  SELECT 1 FROM results
		  WHERE results.map_id = maps.id
		  AND results.user_id = ${userId}
		  AND results.rank = 1
		)`);
    case "not-first":
      return Prisma.raw(`EXISTS (
		  SELECT 1 FROM results
		  WHERE results.map_id = maps.id
		  AND results.user_id = ${userId}
		  AND results.rank > 1
		)`);
    case "perfect":
      return Prisma.raw(`EXISTS (
		  SELECT 1 FROM results
		  JOIN result_statuses ON results.id = result_statuses.result_id
		  WHERE results.map_id = maps.id
		  AND results.user_id = ${userId}
		  AND result_statuses.miss = 0
		  AND result_statuses.lost = 0
		)`);
    default:
      return Prisma.raw("1=1");
  }
}

const generateKeywordFilterSql = ({ mapKeyword }: { mapKeyword: string }) => {
  return mapKeyword !== ""
    ? Prisma.sql`(
  maps."title" &@~ ${mapKeyword} OR
  maps."artist_name" &@~ ${mapKeyword} OR
  maps."music_source" &@~ ${mapKeyword} OR
  maps."tags" &@~ ${mapKeyword} OR
  creator."name" &@~ ${mapKeyword}
  )`
    : Prisma.sql`TRUE`;
};
