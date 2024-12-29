export type FilterMode = "all" | "roma" | "kana" | "romakana";

export interface ResultCardInfo {
  id: number;
  mapId: number;
  userId: number;
  updatedAt: Date;
  clearRate: number;
  score: number;
  miss: number;
  lost: number;
  rank: number;
  kanaType: number;
  romaType: number;
  flickType: number;
  kpm: number;
  romaKpm: number;
  defaultSpeed: number;
  clapCount: number;
  hasClap: boolean;
  map: {
    id: number;
    videoId: string;
    title: string;
    artistName: string;
    musicSource: string;
    previewTime: string;
    thumbnailQuality: "maxresdefault" | "mqdefault";
    updatedAt: Date;
    likeCount: number;
    rankingCount: number;

    user: {
      id: number;
      name: string;
    };
  };
  mapLike: { isLiked: boolean }[];
  result: { rank: number }[];
  user: {
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
