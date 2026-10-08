import type { BundlerConfig } from "dts-bundle-generator/config-schema";

// dts-bundle-generator は require() した結果の entries を直接読むため、default export ではなく名前付き export にする
export const compilationOptions = {
  preferredConfigPath: "./tsconfig.json",
} satisfies BundlerConfig["compilationOptions"];

export const entries = [
  {
    filePath: "./scripts/types-entry-global.ts",
    outFile: "./dist/index.d.ts",
    noCheck: true,
    output: {
      inlineDeclareGlobals: true,
    },
  },
] satisfies BundlerConfig["entries"];
