import { useQueryStates } from "nuqs";
import {
  type ResultListSearchParams,
  resultListSearchParams,
  resultListSerialize,
} from "@/lib/search-params/result-list";
import { useReadSearchPendingParams, useSetIsSearching } from "./atoms";

export const useSetParams = () => {
  const [currentParams] = useQueryStates(resultListSearchParams, { shallow: true });
  const setIsSearching = useSetIsSearching();
  const readSearchRange = useReadSearchPendingParams();

  return (updates?: Partial<ResultListSearchParams>) => {
    const searchPendingParams = readSearchRange();

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
