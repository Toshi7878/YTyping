import { useQueryStates } from "nuqs";
import {
  type ResultListSearchParams,
  resultListSearchParams,
  resultListSerialize,
} from "@/utils/queries/schema/result-list";
import { useReadSearchRange, useSetIsSearching } from "./atoms";

export const useSetParams = () => {
  const [currentParams] = useQueryStates(resultListSearchParams);
  const setIsSearching = useSetIsSearching();
  const readSearchRange = useReadSearchRange();

  return (updates?: Partial<ResultListSearchParams>) => {
    const searchRangeAtom = readSearchRange();

    const searchRangeParams = {
      minKpm: searchRangeAtom.kpm.min,
      maxKpm: searchRangeAtom.kpm.max,
      minClearRate: searchRangeAtom.clearRate.min,
      maxClearRate: searchRangeAtom.clearRate.max,
      minPlaySpeed: searchRangeAtom.playSpeed.min,
      maxPlaySpeed: searchRangeAtom.playSpeed.max,
      mode: searchRangeAtom.mode,
    };

    const mergedParams = { ...currentParams, ...updates, ...searchRangeParams };
    const hasChanged = JSON.stringify(currentParams) !== JSON.stringify(mergedParams);

    if (!hasChanged) return;

    setIsSearching(true);
    window.history.replaceState(null, "", resultListSerialize(mergedParams));
  };
};
