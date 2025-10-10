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
    const searchRangeParams = readSearchRange();
    const mergedParams = { ...currentParams, ...updates, ...searchRangeParams };
    const hasChanged = JSON.stringify(currentParams) !== JSON.stringify(mergedParams);

    if (!hasChanged) return;

    setIsSearching(true);
    window.history.replaceState(null, "", resultListSerialize(mergedParams));
  };
};
