// biome-ignore-all lint/style/noExportedImports: import type is needed to reference names in declare global
import type { YTypingGlobal } from "@/app/_layout/user-script";

export type { YTypingGlobal };

declare global {
  interface Window {
    __ytyping: YTypingGlobal;
  }
}
