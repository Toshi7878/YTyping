export type InputModeType = "roma" | "kana" | "flick";
export type PlayMode = "playing" | "replay" | "practice";
export type SceneType = "ready" | "playing" | "end" | "replay" | "practice";

export type MapData = {
  time: string;
  lyrics: string;
  word: string;
  options?: {
    eternalCSS?: string;
    changeCSS?: string;
    isChangeCSS?: boolean;
    changeVideoSpeed?: number;
  };
};
export type TypeChank = { k: string; r: string[]; p: number };

export type SpeedDifficulty = { median: { r: number; k: number }; max: { r: number; k: number } };

export interface LineData {
  time: number; //後でここは配列に変更する;
  word: TypeChank[];
  lyrics: string; //後でここは配列に変更する;
  kpm: { k: number; r: number };
  notes: { k: number; r: number };
  lineCount?: number;
  kanaWord: string;
  options?: MapData["options"];
}

export interface RefsContextType {
  playerRef: React.RefObject<YouTubePlayer>;
  bestScoreRef: React.MutableRefObject<number>;
  statusRef: React.RefObject<StatusRef>;
  ytStateRef: React.RefObject<YTStateRef>;
  gameStateRef: React.RefObject<GameStateRef>;
  lineProgressRef: React.RefObject<HTMLProgressElement>;
  totalProgressRef: React.RefObject<HTMLProgressElement>;
  cardRefs: React.RefObject<HTMLDivElement[]>;
  setRef: (key: string, ref: HTMLElement | any) => void;
}

export interface LineWord {
  correct: { k: string; r: string };
  nextChar: TypeChank;
  word: TypeChank[];
  kanaDakuten?: string;
  lineCount: number;
}

export interface NextLyricsType {
  lyrics: string;
  kpm: string;
}

export interface Status {
  score: number;
  point: number;
  timeBonus: number;
  type: number;
  miss: number;
  kpm: number;
  lost: number;
  rank: number;
  line: number;
}

export interface GameStateRef {
  isRetrySkip: boolean;
  retryCount: number;
  playMode: PlayMode;
  startPlaySpeed: number;
  displayLineTimeCount: number;
  replay: {
    replayKeyCount: number;
    userName: string;
  };
  practice: {
    hasMyRankingData: boolean;
  };
}

export interface StatusRef {
  status: {
    count: number;
    romaType: number;
    kanaType: number;
    flickType: number;
    rkpm: number;
    clearRate: number;
    kanaToRomaConvertCount: number;
    maxCombo: number;
    missCombo: number;
    totalTypeTime: number;
    totalLatency: number;
    completeCount: number;
    failureCount: number;
  };
  lineStatus: {
    lineType: number;
    lineMiss: number;
    lineClearTime: number;
    latency: number;
    typeResult: TypeResult[];
    lineStartSpeed: number;
    lineStartInputMode: InputModeType;
  };
}

export interface YTStateRef {
  isPaused: boolean;
  movieDuration: number;
}

export interface SendResultData {
  mapId: number;
  status: {
    score: number;
    kanaType: number;
    romaType: number;
    flickType: number;
    miss: number;
    lost: number;
    rkpm: number;
    romaKpm: number; //かな入力・フリック入力の場合もローマ字換算でkpmを計算
    maxCombo: number;
    kpm: number;
    defaultSpeed: number;
    clearRate: number;
  };
}
export interface TypeResult {
  is?: boolean;
  c?: string;
  op?: string;
  t: number;
}

export interface LineResultData {
  status?: {
    p?: number;
    tBonus?: number;
    lType?: number;
    lMiss?: number;
    lRkpm?: number;
    lKpm?: number;
    lostW?: string | null;
    lLost?: number;
    combo: number;
    tTime: number;
    mode: InputModeType;
    sp: number;
  };
  typeResult: TypeResult[];
}

export interface Speed {
  defaultSpeed: number;
  playSpeed: number;
}

export interface useSetStatusValueProps {
  score?: number;
  type?: number;
  kpm?: number;
  rank?: number;
  point?: number;
  miss?: number;
  lost?: number;
  line?: number;
  timeBonus?: number;
}

export type Dakuten =
  | "ゔ"
  | "が"
  | "ぎ"
  | "ぐ"
  | "げ"
  | "ご"
  | "ざ"
  | "じ"
  | "ず"
  | "ぜ"
  | "ぞ"
  | "だ"
  | "ぢ"
  | "づ"
  | "で"
  | "ど"
  | "ば"
  | "び"
  | "ぶ"
  | "べ"
  | "ぼ";

export type NormalizeHirakana =
  | "う"
  | "か"
  | "き"
  | "く"
  | "け"
  | "こ"
  | "さ"
  | "し"
  | "す"
  | "せ"
  | "そ"
  | "た"
  | "ち"
  | "つ"
  | "て"
  | "と"
  | "は"
  | "ひ"
  | "ふ"
  | "へ"
  | "ほ";

export type HanDakuten = "ぱ" | "ぴ" | "ぷ" | "ぺ" | "ぽ";
