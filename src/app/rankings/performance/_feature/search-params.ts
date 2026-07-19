import { useQueryStates } from "nuqs";
import { createLoader, parseAsInteger, parseAsStringLiteral } from "nuqs/server";
import { PP_MODES } from "@/shared/result/pp/mode";

const ppRankingSearchParams = {
  page: parseAsInteger.withDefault(1),
  mode: parseAsStringLiteral(PP_MODES).withDefault("total"),
};

export const loadPpRankingSearchParams = createLoader(ppRankingSearchParams);

export const usePpRankingQueryStates = () => useQueryStates(ppRankingSearchParams);
