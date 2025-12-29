import { createLoader, parseAsStringLiteral } from "nuqs/server";

export const TABS = ["stats", "maps", "results", "liked", "bookmarks"] as const;

export const userPageSearchParamsParser = {
  tab: parseAsStringLiteral(TABS).withDefault("stats"),
};

export const loadUserPageSearchParams = createLoader(userPageSearchParamsParser);
