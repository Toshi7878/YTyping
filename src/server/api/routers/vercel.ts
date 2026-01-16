import type { TRPCRouterRecord } from "@trpc/server";
import { env } from "@/env";
import { JST_OFFSET } from "@/utils/const";
import { getActiveDeployment } from "../lib/vercel";
import { publicProcedure } from "../trpc";

export const vercelRouter = {
  getActiveBuildingAt: publicProcedure.query(async () => {
    if (!env.VERCEL) return;

    const { buildingAt } = await getActiveDeployment();
    if (!buildingAt) return;

    // Vercel APIはUTCで返すが、表示上JSTとして扱いたいため9時間加算する
    return new Date(buildingAt + JST_OFFSET);
  }),
} satisfies TRPCRouterRecord;
