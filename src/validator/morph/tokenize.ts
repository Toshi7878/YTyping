import z from "zod";

export const wordSymbolFilterOptionSchema = z.enum(["non_symbol", "add_symbol", "add_symbol_all"]);

export type WordSymbolFilterOption = z.infer<typeof wordSymbolFilterOptionSchema>;

export const tokenizeSentenceResultSchema = z.object({
  lyrics: z.array(z.string()),
  readings: z.array(z.string()),
});
