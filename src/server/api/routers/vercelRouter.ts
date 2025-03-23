import axios from "axios";
import { publicProcedure } from "../trpc";

export const vercelRouter = {
  getLatestDeployDate: publicProcedure.query(async () => {
    const projectId = process.env.VERCEL_PROJECT_ID;
    const token = process.env.VERCEL_API_TOKEN;

    const response = await axios.get(`https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=1`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const latestDeployment = response.data.deployments[0];
    return new Date(latestDeployment.buildingAt);
  }),
};
