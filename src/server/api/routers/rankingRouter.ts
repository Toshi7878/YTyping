import z from "zod";
import { sql } from "drizzle-orm";
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

    const rows = (await db.execute(sql`
      SELECT
        results."id",
        results."user_id",
        results."clap_count",
        results."updated_at",
        json_build_object(
          'score', rs."score",
          'default_speed', rs."default_speed",
          'kpm', rs."kpm",
          'rkpm', rs."rkpm",
          'roma_kpm', rs."roma_kpm",
          'roma_rkpm', rs."roma_rkpm",
          'roma_type', rs."roma_type",
          'kana_type', rs."kana_type",
          'flick_type', rs."flick_type",
          'english_type', rs."english_type",
          'symbol_type', rs."symbol_type",
          'space_type', rs."space_type",
          'num_type', rs."num_type",
          'miss', rs."miss",
          'lost', rs."lost",
          'max_combo', rs."max_combo",
          'clear_rate', rs."clear_rate"
        ) as "status",
        json_build_object('name', u."name") as "user",
        (
          SELECT rc."is_claped"
          FROM result_claps rc
          WHERE rc."result_id" = results."id" AND rc."user_id" = ${user.id}
          LIMIT 1
        ) as "claps"
      FROM results
      JOIN result_statuses rs ON rs."result_id" = results."id"
      JOIN users u ON u."id" = results."user_id"
      WHERE results."map_id" = ${mapId}
      ORDER BY rs."score" DESC
    `)).rows as any[];

    return rows;
  }),
};
