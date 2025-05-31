import { MapLine } from "@/types/map";
import { $Enums } from "@prisma/client";

export type ConvertOptionsType = "non_symbol" | "add_symbol" | "add_symbol_all";
export interface SendMapInfo {
  title: string;
  artist_name: string;
  music_source: string;
  creator_comment: string;
  tags: string[];
  video_id: string;
  preview_time: string;
  thumbnail_quality: $Enums.thumbnail_quality;
}

export interface SendMapDifficulty {
  roma_kpm_median: number;
  roma_kpm_max: number;
  kana_kpm_median: number;
  kana_kpm_max: number;
  total_time: number;
  roma_total_notes: number;
  kana_total_notes: number;
}

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

type TagsReducerActionType = "set" | "add" | "delete" | "reset";
export type YTSpeedReducerActionType = "up" | "down";

export type TagsReducerAction = { type: TagsReducerActionType; payload?: Tag | Tag[] };
export type TabIndex = 0 | 1 | 2;
