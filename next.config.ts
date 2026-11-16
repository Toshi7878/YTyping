// @ts-check

/** biome-ignore-all lint/style/noProcessEnv: <process.envを使用する必要がある> */
import { varlockNextConfigPlugin } from "@varlock/nextjs-integration/plugin";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withVarlock = varlockNextConfigPlugin();
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: false,
  typedRoutes: true,
  reactCompiler: true,
  compiler: { removeConsole: process.env.NODE_ENV === "production" },
  allowedDevOrigins: ["192.168.11.2"],
  images: {
    minimumCacheTTL: 2678400, // 31 days
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi_webp/**" },
    ],
  },
};

// biome-ignore lint/style/noDefaultExport: required default export
export default withVarlock(withNextIntl(nextConfig));
