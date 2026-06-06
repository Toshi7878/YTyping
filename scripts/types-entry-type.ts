// biome-ignore-all lint/style/noExportedImports: import type is needed to reference names in declare global
import type { YTypingTypeAPI } from "@/app/(typing)/type/_feature/user-script";

export type { YTypingTypeAPI };

declare global {
  interface Window {
    __ytyping_type: YTypingTypeAPI;
  }
}
