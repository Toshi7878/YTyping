import { Vercel } from "@vercel/sdk";
import { ENV } from "varlock/env";

const vercel = new Vercel({
  bearerToken: `Bearer ${ENV.VERCEL_API_TOKEN}`,
});

export const getActiveDeployment = async () => {
  const { deployments } = await vercel.deployments.getDeployments({
    projectId: ENV.VERCEL_PROJECT_ID,
    target: ENV.VERCEL_ENV,
    state: "READY",
    limit: 1,
  });

  const activeDeployment = deployments[0];
  if (!activeDeployment) {
    throw new Error("No deployments found for the configured Vercel project.");
  }
  return activeDeployment;
};
