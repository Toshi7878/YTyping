import { supabase } from "@/lib/supabaseClient";
import { z } from "zod";
import { publicProcedure } from "../trpc";

export const resultRouter = {
  getUserResultData: publicProcedure
    .input(z.object({ resultId: z.number().nullable() }))
    .query(async ({ input }) => {
      try {
        const timestamp = new Date().getTime();

        const { data, error } = await supabase.storage
          .from("user-result") // バケット名を指定
          .download(`public/${input.resultId}.json?timestamp=${timestamp}`);

        if (error) {
          console.error("Error downloading from Supabase:", error);
          throw error;
        }

        const jsonString = await data.text();
        const jsonData = JSON.parse(jsonString);

        return jsonData;
      } catch (error) {
        console.error("Error processing the downloaded file:", error);
        throw error;
      }
    }),
};
