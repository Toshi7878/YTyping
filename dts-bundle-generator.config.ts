import type { BundlerConfig } from "dts-bundle-generator/config-schema";

const config: BundlerConfig = {
  compilationOptions: {
    preferredConfigPath: "./tsconfig.json",
  },
  entries: [
    {
      filePath: "./scripts/types-entry-global.ts",
      outFile: "./dist/index.d.ts",
      noCheck: true,
      libraries: {
        inlinedLibraries: ["sonner"],
      },
      output: {
        inlineDeclareGlobals: true,
      },
    },
  ],
};

export = config;
