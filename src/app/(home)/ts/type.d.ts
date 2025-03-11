export type MapFilter = "liked" | "my-map";
export type PlayFilter = "played" | "unplayed";
export type MapListParams = {
  keyword?: string;
  filter?: string;
  sort?: string;
  maxRate?: string;
  minRate?: string;
  played?: string;
};
