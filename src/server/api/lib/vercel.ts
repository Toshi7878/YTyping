import { Vercel } from "@vercel/sdk";
import { env } from "@/env";

const vercel = new Vercel({
  bearerToken: `Bearer ${env.VERCEL_API_TOKEN}`,
});

export const getLatestDeployment = async () => {
  const { deployments } = await vercel.deployments.getDeployments({ projectId: env.VERCEL_PROJECT_ID, limit: 1 });
  const latest = deployments[0];
  if (!latest) {
    throw new Error("No deployments found for the configured Vercel project.");
  }
  return latest;
};
