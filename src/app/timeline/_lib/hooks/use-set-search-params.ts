import { useReadSearchRange } from "../atoms";
import { DEFAULT_CLEAR_RATE_SEARCH_RANGE, DEFAULT_KPM_SEARCH_RANGE, PARAM_NAME } from "../consts";

export const useSetSearchParams = () => {
  const readSearchRange = useReadSearchRange();

  return (params: URLSearchParams) => {
    const { kpm, clearRate, playSpeed, mode } = readSearchRange();

    if (kpm.minValue !== DEFAULT_KPM_SEARCH_RANGE.min) {
      params.set(PARAM_NAME.minKpm, kpm.minValue.toFixed(0));
    } else {
      params.delete(PARAM_NAME.minKpm);
    }

    if (kpm.maxValue !== DEFAULT_KPM_SEARCH_RANGE.max) {
      params.set(PARAM_NAME.maxKpm, kpm.maxValue.toFixed(0));
    } else {
      params.delete(PARAM_NAME.maxKpm);
    }

    if (clearRate.minValue !== DEFAULT_CLEAR_RATE_SEARCH_RANGE.min) {
      params.set(PARAM_NAME.minClearRate, clearRate.minValue.toFixed(0));
    } else {
      params.delete(PARAM_NAME.minClearRate);
    }

    if (clearRate.maxValue !== DEFAULT_CLEAR_RATE_SEARCH_RANGE.max) {
      params.set(PARAM_NAME.maxClearRate, clearRate.maxValue.toFixed(0));
    } else {
      params.delete(PARAM_NAME.maxClearRate);
    }

    if (playSpeed.minValue !== 1) {
      params.set(PARAM_NAME.minPlaySpeed, playSpeed.minValue.toFixed(2));
    } else {
      params.delete(PARAM_NAME.minPlaySpeed);
    }

    if (playSpeed.maxValue !== 2) {
      params.set(PARAM_NAME.maxPlaySpeed, playSpeed.maxValue.toFixed(2));
    } else {
      params.delete(PARAM_NAME.maxPlaySpeed);
    }

    if (mode !== "all") {
      params.set(PARAM_NAME.mode, mode);
    } else {
      params.delete(PARAM_NAME.mode);
    }

    return params;
  };
};
