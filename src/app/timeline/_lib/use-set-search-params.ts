import { useQueryStates } from "nuqs";
import {
  type ResultListSearchParams,
  resultListSearchParams,
  resultListSerialize,
} from "@/lib/search-params/result-list";
import { readSearchPendingParams, setIsSearching } from "./atoms";

export const useSetSearchParams = () => {
  const [currentParams] = useQueryStates(resultListSearchParams);

  return (updates?: Partial<ResultListSearchParams>) => {
    const searchPendingParams = readSearchPendingParams();

    const mergedParams = {
      ...currentParams,
      ...updates,
      minKpm: searchPendingParams.kpm.min,
      maxKpm: searchPendingParams.kpm.max,
      minClearRate: searchPendingParams.clearRate.min,
      maxClearRate: searchPendingParams.clearRate.max,
      minPlaySpeed: searchPendingParams.playSpeed.min,
      maxPlaySpeed: searchPendingParams.playSpeed.max,
      mode: searchPendingParams.mode,
    };
    const hasChanged = JSON.stringify(currentParams) !== JSON.stringify(mergedParams);

    if (!hasChanged) return;

    setIsSearching(true);
    window.history.replaceState(null, "", resultListSerialize(mergedParams));
  };
};
