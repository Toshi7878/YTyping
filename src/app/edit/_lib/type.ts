import { MapLine } from "@/types/map";

export type ConvertOptionsType = "non_symbol" | "add_symbol" | "add_symbol_all";

export interface EditorNewMapBackUpInfoData {
  title: string;
  artistName: string;
  musicSource: string;
  videoId: string;
  creatorComment: string;
  tags: string[];
  previewTime: string;
  mapData: MapLine[];
}

type SetTagsReducerActionType = {
  type: "set";
  payload: string[];
};

type AddAndDeleteTagsReducerActionType = {
  type: "add" | "delete";
  payload: string;
};

type ResetTagsReducerActionType = {
  type: "reset";
};

export type TagsReducerAction =
  | SetTagsReducerActionType
  | AddAndDeleteTagsReducerActionType
  | ResetTagsReducerActionType;
