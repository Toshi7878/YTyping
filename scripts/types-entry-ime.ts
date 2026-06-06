// biome-ignore-all lint/style/noExportedImports: import type is needed to reference names in declare global
import type { YTypingImeAPI } from "@/app/(typing)/ime/_feature/user-script";

export type { YTypingImeAPI };

declare global {
  interface Window {
    __ytyping_ime: YTypingImeAPI;
  }
}
