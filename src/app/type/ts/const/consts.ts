import { Status } from "../type";

export const RANKING_COLUMN_WIDTH = {
  rank: "7%",
  score: "10%",
  clearRate: "10%",
  userName: "36%",
  kpm: "7%",
  inputMode: "15%",
  updatedAt: "10%",
  clapCount: "5%",
};

export const STATUS_LABEL = [
  ["score", "type", "kpm", "rank"],
  ["point", "miss", "lost", "line"],
].flat();

export const DEFAULT_STATUS: Status = {
  score: 0,
  point: 0,
  timeBonus: 0,
  type: 0,
  miss: 0,
  lost: 0,
  kpm: 0,
  rank: 1,
  line: 0,
};
