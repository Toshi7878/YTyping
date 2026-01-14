import {
  type ResultListSearchParams,
  resultListFilterQueryStates,
  resultListSerialize,
} from "@/lib/search-params/result-list";
import { readSearchPendingParams, setIsSearching } from "./atoms";

export const useSetSearchParams = () => {
  const [filterParams] = resultListFilterQueryStates();

  return (updates?: Partial<ResultListSearchParams>) => {
    const searchPendingParams = readSearchPendingParams();

    const mergedParams = {
      ...filterParams,
      ...updates,
      minKpm: searchPendingParams.kpm.min,
      maxKpm: searchPendingParams.kpm.max,
      minClearRate: searchPendingParams.clearRate.min,
      maxClearRate: searchPendingParams.clearRate.max,
      minPlaySpeed: searchPendingParams.playSpeed.min,
      maxPlaySpeed: searchPendingParams.playSpeed.max,
      mode: searchPendingParams.mode,
    };
    const hasChanged = JSON.stringify(filterParams) !== JSON.stringify(mergedParams);

    if (!hasChanged) return;

    setIsSearching(true);
    window.history.replaceState(null, "", resultListSerialize(mergedParams) || window.location.pathname);
  };
};
