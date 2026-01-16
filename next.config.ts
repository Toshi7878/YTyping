// @ts-check

/** biome-ignore-all lint/style/noProcessEnv: <process.envを使用する必要がある> */
import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  typedRoutes: true,
  reactCompiler: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  experimental: { scrollRestoration: true },
  images: {
    minimumCacheTTL: 2678400, // 31 days
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/vi/**",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/vi_webp/**",
      },
    ],
  },
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
});
