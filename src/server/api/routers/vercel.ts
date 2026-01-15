import type { TRPCRouterRecord } from "@trpc/server";
import { env } from "@/env";
import { JST_OFFSET } from "@/utils/const";
import { getLatestDeployment } from "../lib/vercel";
import { publicProcedure } from "../trpc";

export const vercelRouter = {
  getLatestDeployDate: publicProcedure.query(async () => {
    if (!env.VERCEL) return;

    const { buildingAt } = await getLatestDeployment();
    if (!buildingAt) return;

    // Vercel APIはUTCで返すが、表示上JSTとして扱いたいため9時間加算する
    return new Date(buildingAt + JST_OFFSET);
  }),
} satisfies TRPCRouterRecord;
