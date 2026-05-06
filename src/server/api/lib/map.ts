import { and, eq, exists, type SQLWrapper, sql } from "drizzle-orm";
import type { DBType } from "@/server/drizzle/client";
import { mapBookmarkListItems, mapBookmarkLists, maps } from "@/server/drizzle/schema";
import type { TRPCContext } from "../trpc";

export const bookmarkedMapExists = (
  db: DBType,
  session: NonNullable<TRPCContext["session"]>,
  mapIdColumn: SQLWrapper = maps.id,
) => {
  return exists(
    db
      .select({ one: sql`1` })
      .from(mapBookmarkListItems)
      .innerJoin(mapBookmarkLists, eq(mapBookmarkLists.id, mapBookmarkListItems.listId))
      .where(and(eq(mapBookmarkListItems.mapId, mapIdColumn), eq(mapBookmarkLists.userId, session.user.id))),
  ).mapWith(Boolean);
};
