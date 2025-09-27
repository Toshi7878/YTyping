import axios from "axios";
import { env } from "@/env";
import { publicProcedure } from "../trpc";

export const vercelRouter = {
  getLatestDeployDate: publicProcedure.query(async () => {
    const response = await axios.get(
      `https://api.vercel.com/v6/deployments?projectId=${env.VERCEL_PROJECT_ID}&limit=1`,
      { headers: { Authorization: `Bearer ${env.VERCEL_API_TOKEN}` } },
    );

    const latestDeployment = response.data.deployments[0];
    return new Date(latestDeployment.buildingAt);
  }),
};
