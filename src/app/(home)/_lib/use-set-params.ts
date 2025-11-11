import { useQueryStates } from "nuqs";
import { type MapListSearchParams, mapListSearchParams, mapListSerialize } from "@/lib/search-params/map-list";
import { useReadPendingDifficultyRange, useSetIsSearching } from "./atoms";

export const useSetParams = () => {
  const [params] = useQueryStates(mapListSearchParams);
  const setIsSearching = useSetIsSearching();
  const readPendingDifficultyRange = useReadPendingDifficultyRange();

  return (updates?: Partial<MapListSearchParams>) => {
    const rangeParams = readPendingDifficultyRange();
    const mergedParams = { ...params, ...updates, ...rangeParams };
    const isChanged = JSON.stringify(params) !== JSON.stringify(mergedParams);
    if (!isChanged) return;

    setIsSearching(true);
    window.history.replaceState(null, "", mapListSerialize(mergedParams));
  };
};
