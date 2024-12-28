import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { z } from "zod";
import { publicProcedure } from "../trpc";

export const rankingRouter = {
  getMapRanking: publicProcedure.input(z.object({ mapId: z.number() })).query(async ({ input }) => {
    const { mapId } = input;
    const session = await auth();
    const userId = session ? Number(session.user.id) : 0;

    const rankingList = await db.result.findMany({
      where: {
        mapId,
      },
      select: {
        id: true,
        userId: true,
        score: true,
        defaultSpeed: true,
        kpm: true,
        rkpm: true,
        romaKpm: true,
        romaType: true,
        kanaType: true,
        flickType: true,
        miss: true,
        lost: true,
        maxCombo: true,
        clapCount: true,
        clearRate: true,
        updatedAt: true,
        user: {
          select: {
            name: true,
          },
        },
        clap: {
          where: {
            userId: userId ? userId : undefined,
          },
          select: {
            isClaped: true,
          },
        },
      },
      orderBy: {
        score: "desc",
      },
    });

    return rankingList;
  }),
};
