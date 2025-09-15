import z from "zod";
import { sql } from "drizzle-orm";
import { publicProcedure } from "../trpc";

const userStatusSchema = z.array(
  z.object({
    id: z.number(),
    name: z.string(),
    onlineAt: z.coerce.date(),
    state: z.string(),
    mapId: z.number().nullable(),
  }),
);

export const activeUserRouter = {
  getUserPlayingMaps: publicProcedure.input(userStatusSchema).query(async ({ input, ctx }) => {
    const { db, user } = ctx;

    const userListPromises = input.map(async (activeUser) => {
      if (activeUser.state === "type" && activeUser.mapId) {
        const rows = (await db.execute(sql`
          SELECT
            maps."id",
            maps."title",
            maps."artist_name",
            maps."music_source",
            maps."video_id",
            maps."creator_id",
            maps."updated_at",
            maps."preview_time",
            maps."thumbnail_quality",
            maps."like_count",
            maps."ranking_count",
            json_build_object(
              'roma_kpm_median', "difficulty"."roma_kpm_median",
              'roma_kpm_max', "difficulty"."roma_kpm_max",
              'total_time', "difficulty"."total_time"
            ) as "difficulty",
            EXISTS (
              SELECT 1 FROM map_likes ml
              WHERE ml."map_id" = maps."id" AND ml."user_id" = ${user.id} AND ml."is_liked" = true
            ) as is_liked,
            (
              SELECT MIN(r."rank")::int FROM results r
              WHERE r."map_id" = maps."id" AND r."user_id" = ${user.id}
            ) as "myRank",
            json_build_object('id', creator."id", 'name', creator."name") as "creator"
          FROM maps
          JOIN users AS creator ON maps."creator_id" = creator."id"
          LEFT JOIN map_difficulties AS "difficulty" ON maps."id" = "difficulty"."map_id"
          WHERE maps."id" = ${activeUser.mapId}
          LIMIT 1
        `)).rows as any[];

        const mapInfo = rows[0] ?? null;
        const normalizedMap = mapInfo
          ? { ...mapInfo, difficulty: mapInfo.difficulty ?? { roma_kpm_median: 0, roma_kpm_max: 0, total_time: 0 } }
          : null;

        return { ...activeUser, map: normalizedMap };
      } else {
        return { ...activeUser, map: null };
      }
    });

    const userList = await Promise.all(userListPromises);
    return userList;
  }),
};
