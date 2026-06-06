// biome-ignore-all lint/style/noExportedImports: import type is needed to reference names in declare global

import type { YTypingGlobal } from "@/app/_layout/user-script";
import type { YTypingImeAPI } from "@/app/(typing)/ime/_feature/user-script";
import type { YTypingTypeAPI } from "@/app/(typing)/type/_feature/user-script";

export type { YTypingGlobal, YTypingImeAPI, YTypingTypeAPI };

declare global {
  interface Window {
    __ytyping_type: YTypingTypeAPI;
    __ytyping_ime: YTypingImeAPI;
    __ytyping: YTypingGlobal;
  }
}
