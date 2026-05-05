import z from "zod/v4";

export const SelectResultPpListApiSchema = z.object({
  playerId: z.number(),
  cursor: z.number().optional(),
  order: z.enum(["asc", "desc"]).optional().default("asc"),
});
