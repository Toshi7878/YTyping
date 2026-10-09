import { ENV } from "varlock/env";

export const getBaseUrl = () => {
  if (typeof window !== "undefined") return window.location.origin;
  if (ENV.VERCEL_URL) return `https://${ENV.VERCEL_URL}`;
  return `http://localhost:${ENV.PORT ?? 3000}`;
};
