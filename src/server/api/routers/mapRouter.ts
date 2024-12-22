import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { z } from "zod";
import { publicProcedure } from "../trpc";

export const mapRouter = {
  getMapInfo: publicProcedure.input(z.object({ mapId: z.number() })).query(async ({ input }) => {
    const { mapId } = input;

    const session = await auth();
    const userId = session?.user ? Number(session?.user.id) : 0;

    const mapInfo = await db.map.findUnique({
      where: { id: mapId },
      select: {
        title: true,
        artistName: true,
        musicSource: true,
        creatorComment: true,
        creatorId: true,
        tags: true,
        videoId: true,
        previewTime: true,
        updatedAt: true,
        mapLike: {
          where: { userId },
          select: { isLiked: true },
        },
      },
    });

    return mapInfo;
  }),
};
