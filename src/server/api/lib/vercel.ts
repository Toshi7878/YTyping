import { Vercel } from "@vercel/sdk";
import { env } from "@/env";

const vercel = new Vercel({
  bearerToken: `Bearer ${env.VERCEL_API_TOKEN}`,
});

export const getActiveDeployment = async () => {
  const { deployments } = await vercel.deployments.getDeployments({
    projectId: env.VERCEL_PROJECT_ID,
    target: env.VERCEL_ENV,
    state: "READY",
    limit: 1,
  });

  const activeDeployment = deployments[0];
  if (!activeDeployment) {
    throw new Error("No deployments found for the configured Vercel project.");
  }
  return activeDeployment;
};
