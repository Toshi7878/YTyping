import { ENV } from "varlock/env";
import { JST_OFFSET } from "@/utils/date";
import { getActiveDeployment } from "../lib/vercel";
import { publicProcedure } from "../orpc";

export const vercelRouter = {
  getActiveBuildingAt: publicProcedure.handler(async () => {
    if (!ENV.VERCEL) return;

    const { buildingAt } = await getActiveDeployment();
    if (!buildingAt) return;

    // Vercel APIはUTCで返すが、表示上JSTとして扱いたいため9時間加算する
    return new Date(buildingAt + JST_OFFSET);
  }),
};
