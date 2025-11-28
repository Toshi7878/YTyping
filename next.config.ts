// @ts-check

/** @type {import('next').NextConfig} */
/** biome-ignore-all lint/style/noProcessEnv: <process.envを使用する必要がある> */
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig = {
  reactStrictMode: false,
  typedRoutes: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  experimental: { scrollRestoration: true },
};

// @see https://www.npmjs.com/package/@sentry/webpack-plugin#options
// @see https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

// biome-ignore lint/style/noDefaultExport: <default exportする必要がある>
export default withSentryConfig(nextConfig, {
  org: "ytyping-team",
  project: "ytyping",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  disableLogger: true,
  automaticVercelMonitors: true,
  reactComponentAnnotation: { enabled: true },
});
