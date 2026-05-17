import { useQueryState } from "nuqs";
import { createLoader, parseAsInteger } from "nuqs/server";

const ppRankingSearchParams = {
  page: parseAsInteger.withDefault(1),
};

export const loadPpRankingSearchParams = createLoader(ppRankingSearchParams);

export const usePpRankingPageQueryState = () => useQueryState("page", parseAsInteger.withDefault(1));
