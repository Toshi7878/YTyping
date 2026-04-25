import { useQueryState } from "nuqs";
import { createLoader, createSerializer, parseAsInteger, parseAsStringLiteral } from "nuqs/server";

export const TABS = ["stats", "maps", "results", "liked", "bookmarks"] as const;
const PP_ORDERS = ["asc", "desc"] as const;

const userPageSearchParamsParsers = {
  tab: parseAsStringLiteral(TABS).withDefault("stats"),
  bookmarkListId: parseAsInteger,
  targetYear: parseAsInteger,
  ppOrder: parseAsStringLiteral(PP_ORDERS).withDefault("desc"),
};

export const useBookmarkListIdQueryState = () =>
  useQueryState("bookmarkListId", userPageSearchParamsParsers.bookmarkListId);
export const useTargetYearQueryState = () => useQueryState("targetYear", userPageSearchParamsParsers.targetYear);
export const useTabQueryState = () => useQueryState("tab", userPageSearchParamsParsers.tab);
export const usePpOrderQueryState = () =>
  useQueryState("ppOrder", userPageSearchParamsParsers.ppOrder.withOptions({ shallow: true }));

export const loadUserPageSearchParams = createLoader(userPageSearchParamsParsers);
export const serializeUserPageSearchParams = createSerializer(userPageSearchParamsParsers);
