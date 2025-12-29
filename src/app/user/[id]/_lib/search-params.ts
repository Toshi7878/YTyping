import { createLoader, createSerializer, parseAsInteger, parseAsStringLiteral } from "nuqs/server";

export const TABS = ["stats", "maps", "results", "liked", "bookmarks"] as const;

export const userPageSearchParamsParser = {
  tab: parseAsStringLiteral(TABS).withDefault("stats"),
  bookmarkListId: parseAsInteger,
};

export const loadUserPageSearchParams = createLoader(userPageSearchParamsParser);
export const serializeUserPageSearchParams = createSerializer(userPageSearchParamsParser);
