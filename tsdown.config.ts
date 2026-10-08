import { defineConfig } from "tsdown";

// biome-ignore lint/style/noDefaultExport: tsdown requires default export
export default defineConfig({
  entry: { index: "./scripts/types-entry-global.ts" },
  tsconfig: "./tsconfig.json",
  format: "esm",
  // 型定義(dist/index.d.ts)のみを生成する
  dts: { emitDtsOnly: true },
  outDir: "dist",
  clean: true,
});
