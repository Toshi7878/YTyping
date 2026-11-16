import { useQueryState } from "nuqs";
import { createLoader, createSerializer, parseAsBoolean, parseAsInteger, parseAsStringLiteral } from "nuqs/server";

export const TABS = ["stats", "maps", "results", "liked", "bookmarks"] as const;
const PP_ORDERS = ["asc", "desc"] as const;

const userPageSearchParamsParsers = {
  tab: parseAsStringLiteral(TABS).withDefault("stats"),
  bookmarkListId: parseAsInteger,
  invalidResults: parseAsBoolean.withDefault(false),
  targetYear: parseAsInteger,
  ppOrder: parseAsStringLiteral(PP_ORDERS).withDefault("desc"),
};

export const useBookmarkListIdQueryState = () =>
  useQueryState("bookmarkListId", userPageSearchParamsParsers.bookmarkListId);
export const useInvalidResultsQueryState = () =>
  useQueryState("invalidResults", userPageSearchParamsParsers.invalidResults);
export const useTargetYearQueryState = () => useQueryState("targetYear", userPageSearchParamsParsers.targetYear);
export const useTabQueryState = () => useQueryState("tab", userPageSearchParamsParsers.tab);
export const usePpOrderQueryState = () =>
  useQueryState("ppOrder", userPageSearchParamsParsers.ppOrder.withOptions({ shallow: true }));

export const loadUserPageSearchParams = createLoader(userPageSearchParamsParsers);

const serializer = createSerializer(userPageSearchParamsParsers);
export const buildUserBookmarkListUrl = (userId: string, listId: number): `/user/${string}` => {
  return `/user/${userId}${serializer({ tab: "bookmarks", bookmarkListId: listId })}`;
};

export const buildUserInvalidResultsUrl = (userId: string): `/user/${string}` => {
  return `/user/${userId}${serializer({ tab: "results", invalidResults: true })}`;
};
