import type { BundlerConfig } from "dts-bundle-generator/config-schema";

const config: BundlerConfig = {
  compilationOptions: {
    preferredConfigPath: "./tsconfig.json",
  },
  entries: [
    {
      filePath: "./scripts/types-entry-type.ts",
      outFile: "./dist/typing-type.d.ts",
      noCheck: true,
      output: {
        inlineDeclareGlobals: true,
      },
    },
    {
      filePath: "./scripts/types-entry-ime.ts",
      outFile: "./dist/typing-ime.d.ts",
      noCheck: true,
      output: {
        inlineDeclareGlobals: true,
      },
    },
    {
      filePath: "./scripts/types-entry-global.ts",
      outFile: "./dist/global.d.ts",
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
