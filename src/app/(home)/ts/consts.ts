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

export const MY_FILTER = {
  name: PARAM_NAME.filter,
  label: "フィルター",
  params: [
    { label: "いいね済", value: "liked" as const },
    { label: "作成した譜面", value: "my-map" as const },
  ],
};

export const PLAYED_FILTER = {
  name: PARAM_NAME.played,
  label: "ランキング",
  params: [
    { label: "1位", value: "1st" as const },
    { label: "2位以下", value: "not-first" as const },
    { label: "登録済", value: "played" as const },
    { label: "未登録", value: "unplayed" as const },
    { label: "パーフェクト", value: "perfect" as const },
  ],
};

export const PAGE_SIZE = 40;
