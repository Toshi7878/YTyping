import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { z } from "zod";
import { publicProcedure } from "../trpc";

export const rankingRouter = {
  getMapRanking: publicProcedure.input(z.object({ mapId: z.number() })).query(async ({ input }) => {
    const { mapId } = input;
    const session = await auth();
    const userId = session ? Number(session.user.id) : 0;

    const rankingList = await prisma.results.findMany({
      where: {
        map_id: mapId,
      },
      select: {
        id: true,
        user_id: true,
        clap_count: true,
        updated_at: true,
        status: {
          select: {
            score: true,
            default_speed: true,
            kpm: true,
            rkpm: true,
            roma_kpm: true,
            roma_type: true,
            kana_type: true,
            flick_type: true,
            english_type: true,
            symbol_type: true,
            space_type: true,
            num_type: true,
            miss: true,
            lost: true,
            max_combo: true,
            clear_rate: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
        claps: {
          where: {
            user_id: userId ? userId : undefined,
          },
          select: {
            is_claped: true,
          },
        },
      },
      orderBy: {
        status: {
          score: "desc",
        },
      },
    });

    return rankingList;
  }),
};
