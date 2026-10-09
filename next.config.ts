// @ts-check

/** biome-ignore-all lint/style/noProcessEnv: <process.envを使用する必要がある> */
import { varlockNextConfigPlugin } from "@varlock/nextjs-integration/plugin";
import type { NextConfig } from "next";

const withVarlock = varlockNextConfigPlugin();

const nextConfig: NextConfig = {
  reactStrictMode: false,
  typedRoutes: true,
  reactCompiler: true,
  compiler: { removeConsole: process.env.NODE_ENV === "production" },
  images: {
    minimumCacheTTL: 2678400, // 31 day
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi_webp/**" },
    ],
  },
};

// biome-ignore lint/style/noDefaultExport: required default export
export default withVarlock(nextConfig);
