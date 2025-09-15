import { ResultClaps, Results, ResultStatuses, Users } from "@/server/drizzle/schema";
import { and, desc, eq } from "drizzle-orm";
import z from "zod";
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
      roma_rkpm: z.number(),
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
            lRkpm: z.number().or(z.literal(Infinity)).optional(),
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
          }),
        ),
      }),
    ),
  })
  .refine(() => true, { message: "リザルトデータの形式が無効です" });

export const rankingRouter = {
  getMapRanking: publicProcedure.input(z.object({ mapId: z.number() })).query(async ({ input, ctx }) => {
    const { db, user } = ctx;
    const { mapId } = input;

    return db
      .select({
        id: Results.id,
        updatedAt: Results.updatedAt,
        player: { id: Results.userId, name: Users.name },
        clap: { count: Results.clapCount, hasClaped: ResultClaps.isClaped },
        score: ResultStatuses.score,
        otherStatus: {
          playSpeed: ResultStatuses.defaultSpeed,
          miss: ResultStatuses.miss,
          lost: ResultStatuses.lost,
          maxCombo: ResultStatuses.maxCombo,
          clearRate: ResultStatuses.clearRate,
        },
        typeSpeed: {
          kpm: ResultStatuses.kpm,
          rkpm: ResultStatuses.rkpm,
          romaKpm: ResultStatuses.romaKpm,
          romaRkpm: ResultStatuses.romaRkpm,
        },
        typeCounts: {
          romaType: ResultStatuses.romaType,
          kanaType: ResultStatuses.kanaType,
          flickType: ResultStatuses.flickType,
          englishType: ResultStatuses.englishType,
          symbolType: ResultStatuses.symbolType,
          spaceType: ResultStatuses.spaceType,
          numType: ResultStatuses.numType,
        },
      })
      .from(Results)
      .innerJoin(ResultStatuses, eq(ResultStatuses.resultId, Results.id))
      .innerJoin(Users, eq(Users.id, Results.userId))
      .leftJoin(ResultClaps, and(eq(ResultClaps.resultId, Results.id), eq(ResultClaps.userId, user.id ?? 0)))
      .where(eq(Results.mapId, mapId))
      .orderBy(desc(ResultStatuses.score));
  }),
};
