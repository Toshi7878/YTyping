import { and, eq, exists, type SQLWrapper, sql } from "drizzle-orm";
import type { DBType } from "@/server/drizzle/client";
import { MapBookmarkListItems, MapBookmarkLists, Maps } from "@/server/drizzle/schema";
import type { TRPCContext } from "../trpc";

export const bookmarkedMapExists = (
  db: DBType,
  session: NonNullable<TRPCContext["session"]>,
  mapIdColumn: SQLWrapper = Maps.id,
) => {
  return exists(
    db
      .select({ one: sql`1` })
      .from(MapBookmarkListItems)
      .innerJoin(MapBookmarkLists, eq(MapBookmarkLists.id, MapBookmarkListItems.listId))
      .where(and(eq(MapBookmarkListItems.mapId, mapIdColumn), eq(MapBookmarkLists.userId, session.user.id))),
  ).mapWith(Boolean);
};
