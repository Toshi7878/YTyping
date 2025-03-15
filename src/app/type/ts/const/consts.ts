import { Ticker } from "@pixi/ticker";

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

export const CHANGE_TIME_OFFSET_VALUE = 0.05;
export const TIME_OFFSET_SHORTCUTKEY_RANGE = 0.1;

export const typeTicker = new Ticker();
