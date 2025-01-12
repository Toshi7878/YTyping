import { $Enums } from "@prisma/client";

export type ConvertOptionsType = "non_symbol" | "add_symbol" | "add_symbol_all";
export interface EditorSendData {
  title: string;
  artistName: string;
  musicSource: string;
  creatorComment: string;
  tags: string[];
  videoId: string;
  previewTime: string;
  romaKpmMedian: number;
  romaKpmMax: number;
  kanaKpmMedian: number;
  kanaKpmMax: number;
  totalTime: number;
  romaTotalNotes: number;
  kanaTotalNotes: number;
  thumbnailQuality: $Enums.ThumbnailQuality;
}

export interface EditorNewMapBackUpInfoData {
  title: string;
  artistName: string;
  musicSource: string;
  videoId: string;
  creatorComment: string;
  tags: string[];
  previewTime: string;
}

export type EditTabIndex = 0 | 1 | 2;

export interface EditStatusRef {
  isNotAutoTabToggle: boolean;
}

type TagsReducerActionType = "set" | "add" | "delete" | "reset";
type LineInputReducerActionType = "set" | "reset";
export type YTSpeedReducerActionType = "up" | "down";
export type LineInputReducerAction = { type: LineInputReducerActionType; payload?: LineInput };
export type TagsReducerAction = { type: TagsReducerActionType; payload?: Tag | Tag[] };

export interface GetYouTubeMovieInfo {
  channelTitle: string;
  description: string;
  title: string;
  tags: string[];
}

export interface GeminiMapInfo {
  musicTitle: string;
  artistName: string;
  musicSource: string;
  otherTags: string[];
}
