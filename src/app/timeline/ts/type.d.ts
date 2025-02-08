import { $Enums } from "@prisma/client";

export type FilterMode = "all" | "roma" | "kana" | "romakana";

export interface ResultCardInfo {
  id: number;
  map_id: number;
  user_id: number;
  clap_count: number;
  hasClap: boolean;
  rank: number;
  updated_at: Date;
  status: {
    score: number;
    default_speed: number;
    miss: number;
    lost: number;
    kpm: number;
    roma_kpm: number;
    kana_type: number;
    roma_type: number;
    flick_type: number;
    english_type: number;
    symbol_type: number;
    num_type: number;
    space_type: number;
    clear_rate: number;
  };

  map: {
    id: number;
    video_id: string;
    title: string;
    artist_name: string;
    music_source: string;
    preview_time: string;
    thumbnail_quality: $Enums.ThumbnailQuality;
    updated_at: Date;
    like_count: number;
    ranking_count: number;
    creator: {
      id: number;
      name: string;
    };
    map_likes: { is_liked: boolean }[];
    results: { rank: number }[];
  };
  player: {
    id: number;
    name: string;
  };
}

export interface SearchResultKeyWords {
  mapKeyWord: string;
  userName: string;
}

export interface SearchResultRange {
  minValue: number;
  maxValue: number;
}
