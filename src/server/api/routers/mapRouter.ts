import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { z } from "zod";
import { publicProcedure } from "../trpc";

export const mapRouter = {
  getMapInfo: publicProcedure.input(z.object({ mapId: z.number() })).query(async ({ input }) => {
    const { mapId } = input;

    const session = await auth();
    const userId = session?.user ? Number(session?.user.id) : 0;

    const mapInfo = await prisma.map.findUnique({
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
  getCreatedVideoIdMapList: publicProcedure
    .input(z.object({ videoId: z.string().length(11) }))
    .query(async ({ input }) => {
      const { videoId } = input;
      const session = await auth();
      const userId = session ? Number(session.user.id) : 0;

      const mapList = await prisma.map.findMany({
        where: {
          videoId,
        },
        select: {
          id: true,
          title: true,
          artistName: true,
          musicSource: true,
          romaKpmMedian: true,
          romaKpmMax: true,
          videoId: true,
          updatedAt: true,
          previewTime: true,
          totalTime: true,
          thumbnailQuality: true,
          likeCount: true,
          rankingCount: true,
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          mapLike: {
            where: {
              userId,
            },
            select: {
              isLiked: true,
            },
          },
          result: {
            where: {
              userId,
            },
            select: {
              rank: true,
            },
          },
        },
        orderBy: {
          id: "desc",
        },
      });

      return mapList;
    }),
};
