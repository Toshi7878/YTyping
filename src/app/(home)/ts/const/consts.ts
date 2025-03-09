export const HOME_THUBNAIL_WIDTH = { base: 160, sm: 220 };
export const HOME_THUBNAIL_HEIGHT = {
  base: (HOME_THUBNAIL_WIDTH.base * 9) / 16,
  sm: (HOME_THUBNAIL_WIDTH.sm * 9) / 16,
};

export const DIFFICULTY_RANGE = {
  min: 0,
  max: 12,
};

export const PARAM_NAME = {
  keyword: "keyword" as const,
  minRate: "minRate" as const,
  maxRate: "maxRate" as const,
  sort: "sort" as const,
  filter: "filter" as const,
  played: "played" as const,
};
