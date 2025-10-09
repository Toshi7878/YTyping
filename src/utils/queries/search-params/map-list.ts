import type { inferParserType } from "nuqs";
import {
  createLoader,
  createParser,
  createSerializer,
  parseAsFloat,
  parseAsString,
  parseAsStringEnum,
  parseAsStringLiteral,
} from "nuqs/server";
import * as z from "zod";

const baseFields = [
  "id",
  "difficulty",
  "ranking-count",
  "ranking-register",
  "like-count",
  "duration",
  "like",
  "random",
] as const;

export type SortFieldType = (typeof baseFields)[number];

const FilterEnum = z.enum(["liked", "my-map"]);
const RankingStatusEnum = z.enum(["1st", "not-first", "registerd", "unregisterd", "perfect"]);

export const MapSearchParamsSchema = z.object({
  filter: FilterEnum.nullable(),
  rankingStatus: RankingStatusEnum.nullable(),
  keyword: z.string().default(""),
  minRate: z.number(),
  maxRate: z.number(),
});

const parseAsSort = createParser({
  parse(query): { id: SortFieldType; desc: boolean } | null {
    const [key = "", direction = ""] = query.split(":");
    const desc = parseAsStringLiteral(["asc", "desc"]).parse(direction) ?? "desc";

    const validFields = baseFields;
    if (!validFields.includes(key as SortFieldType)) return null;

    return {
      id: key as SortFieldType,
      desc: desc === "desc",
    };
  },
  serialize(value: { id: SortFieldType; desc: boolean }) {
    return `${value.id}:${value.desc ? "desc" : "asc"}`;
  },
});

export const mapListSearchParams = {
  sort: parseAsSort.withDefault({ id: "id", desc: true }),
  keyword: parseAsString.withDefault(""),
  minRate: parseAsFloat.withDefault(0),
  maxRate: parseAsFloat.withDefault(12),
  filter: parseAsStringEnum(FilterEnum.options),
  rankingStatus: parseAsStringEnum(RankingStatusEnum.options),
};

export type MapListSearchParams = inferParserType<typeof mapListSearchParams>;

export const loadMapListSearchParams = createLoader(mapListSearchParams);
export const mapListSerialize = createSerializer(mapListSearchParams);
