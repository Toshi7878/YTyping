import { z } from "@/validator/z";
import { publicProcedure } from "../trpc";

export const sendResultSchema = z
  .object({
    mapId: z.number(),
    status: z.object({
      score: z.number(),
      kana_type: z.number(),
      roma_type: z.number(),
      flick_type: z.number(),
      english_type: z.number(),
      space_type: z.number(),
      symbol_type: z.number(),
      num_type: z.number(),
      miss: z.number(),
      lost: z.number(),
      max_combo: z.number(),
      kpm: z.number(),
      rkpm: z.number(),
      roma_kpm: z.number(),
      default_speed: z.number(),
      clear_rate: z.number(),
    }),
    lineResults: z.array(
      z.object({
        status: z
          .object({
            p: z.number().optional(),
            tBonus: z.number().optional(),
            lType: z.number().optional(),
            lMiss: z.number().optional(),
            lRkpm: z.number().optional(),
            lKpm: z.number().optional(),
            lostW: z.string().nullable().optional(),
            lLost: z.number().optional(),
            combo: z.number(),
            tTime: z.number(),
            mode: z.enum(["roma", "kana", "flick"]),
            sp: z.number(),
          })
          .optional(),
        typeResult: z.array(
          z.object({
            is: z.boolean().optional(),
            c: z.string().optional(),
            op: z.string().optional(),
            t: z.number(),
          })
        ),
      })
    ),
  })
  .refine(() => true, { message: "リザルトデータの形式が無効です" });

export const rankingRouter = {
  getMapRanking: publicProcedure.input(z.object({ mapId: z.number() })).query(async ({ input, ctx }) => {
    const { db, user } = ctx;
    const { mapId } = input;

    const rankingList = await db.results.findMany({
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
            user_id: user.id,
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
