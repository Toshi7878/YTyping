export const TIMELINE_THUBNAIL_WIDTH = { base: 120 };
export const TIMELINE_THUBNAIL_HEIGHT = {
  base: (TIMELINE_THUBNAIL_WIDTH.base * 9) / 16,
};

export const DEFAULT_KPM_SEARCH_RANGE = { min: 0, max: 1200 };
export const DEFAULT_CLEAR_RATE_SEARCH_RANGE = { min: 0, max: 100 };

export const PARAM_NAME = {
  username: "username",
  mapkeyword: "mapkeyword",
  mode: "mode",
  minKpm: "minKpm",
  maxKpm: "maxKpm",
  minClearRate: "minClearRate",
  maxClearRate: "maxClearRate",
  minPlaySpeed: "minPlaySpeed",
  maxPlaySpeed: "maxPlaySpeed",
} as const;

export const PAGE_SIZE = 30;
