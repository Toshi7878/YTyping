import { useStore } from "jotai";
import { difficultyRangeAtom } from "../atoms/atoms";
import { DIFFICULTY_RANGE, PARAM_NAME } from "../ts/consts";

export const useDifficultyRangeParams = () => {
  const homeAtomStore = useStore();

  return (params: URLSearchParams) => {
    const difficultyRange = homeAtomStore.get(difficultyRangeAtom);

    if (difficultyRange.min !== DIFFICULTY_RANGE.min) {
      params.set(PARAM_NAME.minRate, difficultyRange.min.toFixed(1));
    } else {
      params.delete(PARAM_NAME.minRate);
    }

    if (difficultyRange.max !== DIFFICULTY_RANGE.max) {
      params.set(PARAM_NAME.maxRate, difficultyRange.max.toFixed(1));
    } else {
      params.delete(PARAM_NAME.maxRate);
    }

    return params;
  };
};
