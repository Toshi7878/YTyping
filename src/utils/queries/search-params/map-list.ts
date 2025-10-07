import type { inferParserType } from "nuqs";
import { createLoader, parseAsFloat, parseAsString, parseAsStringEnum } from "nuqs/server";
import * as z from "zod";

const baseFields = ["id", "difficulty", "ranking-count", "ranking-register", "like-count", "duration", "like"] as const;

const generatedSortKeys = baseFields.flatMap((f) => [`${f}_asc`, `${f}_desc`] as const);
export const MapListSortEnumSchema = z.enum([...generatedSortKeys, "random"]);
export type SortFieldType = (typeof baseFields)[number] | "random";

const FilterEnum = z.enum(["liked", "my-map"]);
const RankingStatusEnum = z.enum(["1st", "not-first", "registerd", "unregisterd", "perfect"]);

export const MapSearchParamsSchema = z.object({
  filter: FilterEnum.nullable(),
  rankingStatus: RankingStatusEnum.nullable(),
  keyword: z.string().default(""),
  minRate: z.number(),
  maxRate: z.number(),
});

export const mapListSearchParams = {
  sort: parseAsStringEnum(MapListSortEnumSchema.options),
  keyword: parseAsString.withDefault(""),
  minRate: parseAsFloat.withDefault(0),
  maxRate: parseAsFloat.withDefault(12),
  filter: parseAsStringEnum(FilterEnum.options),
  rankingStatus: parseAsStringEnum(RankingStatusEnum.options),
};

export type MapListSearchParams = inferParserType<typeof mapListSearchParams>; // number | null

export const loadSearchParams = createLoader(mapListSearchParams);
