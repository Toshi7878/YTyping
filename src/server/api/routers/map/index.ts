import type { BaseSelectItem } from "./list";

export type MapListItem = Omit<BaseSelectItem, "media"> & {
  media: BaseSelectItem["media"] & { previewSpeed?: number };
};
