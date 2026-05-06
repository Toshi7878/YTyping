/**
 * YTyping ユーザースクリプト向けフック
 *
 * ## イベント命名規則
 * `{domain}:{event}`
 * - `type`   : 入力イベント（通常プレイ・練習）
 * - `replay` : リプレイのシミュレート打鍵
 * - `restart`: プレイ再開（`restartPlay`）
 * - `timer`  : タイマーイベント
 * - `yt`     : YouTube プレイヤーイベント
 *
 * ## タイピングイベント（通常プレイ・練習）
 * @example
 * window.__ytyping_type.addEventListener("type:success", (detail) => {
 *   const { successKey, isCompleted, constantLineTime, updatePoint } = detail;
 * });
 * window.__ytyping_type.addEventListener("type:miss",          (detail) => console.log("miss!", detail.failKey));
 * window.__ytyping_type.addEventListener("type:lineCompleted", (detail) => console.log("line done!", detail.constantLineTime));
 *
 * ## リプレイ打鍵イベント（`simulateTypingInput` 経由。`detail` の形は通常の type 系と同じ）
 * @example
 * window.__ytyping_type.addEventListener("replay:type:success", (detail) => {
 *   const { successKey, isCompleted, constantLineTime, updatePoint } = detail;
 * });
 * window.__ytyping_type.addEventListener("replay:type:miss", (detail) => console.log("replay miss", detail.failKey));
 * window.__ytyping_type.addEventListener("replay:type:lineCompleted", (detail) => console.log("replay line", detail.constantLineTime));
 *
 * ## 再開イベント（`lib/play-restart` の `restartPlay` 完了後）
 * @example
 * window.__ytyping_type.addEventListener("restart", () => { ... });
 *
 * ## タイマーイベント
 * @example
 * window.__ytyping_type.addEventListener("timer:update", (detail) => {
 *   const { currentTime, constantLineTime, constantRemainLineTime } = detail;
 * });
 * window.__ytyping_type.addEventListener("timer:lineChange", (detail) => console.log("line →", detail.nextCount));
 * window.__ytyping_type.addEventListener("timer:end",        (detail) => console.log("end!", detail.constantLineTime));
 *
 * ## getter（任意タイミングで現在値を取得）
 * @example
 * const { kpm, score, miss } = window.__ytyping_type.getStatus();
 * const { maxCombo, clearRate } = window.__ytyping_type.getSubstatus();
 * const { typeCount, missCount } = window.__ytyping_type.getLineSubstatus();
 * const { CHAR_POINT, MISS_PENALTY_POINT } = window.__ytyping_type;
 * const mapMeta = window.__ytyping_type.getMapInfo();
 * const rawPp = window.__ytyping_type.calcRawPP({ accuracy: 0.99, clearRate: 1, minPlaySpeed: 1 }, 5.2);
 * const topPps = await window.__ytyping_type.getUserTopPPs(); // ログイン中ユーザーの PP 降順配列 { mapId, pp }[]
 */

import { calcRawPP } from "@/shared/result/pp/calc";
import { getQueryClient, getTRPCOptions } from "@/trpc/provider";
import { getBuiltMap } from "./atoms/built-map";
import { getAllLineResult, getSelectLineIndex } from "./atoms/line-result";
import { getLineSubstatus } from "./atoms/line-substatus";
import { getReplayRankingResult } from "./atoms/replay";
import { getTypingStats } from "./atoms/stats";
import { getTypingSubstatus } from "./atoms/substatus";
import { getPlayingInputMode, getTypingWord } from "./atoms/typing-word";
import { getYTCurrentTime, getYTPlayer, getYTPlayerState, getYTVideoId } from "./atoms/youtube-player";
import { CHAR_POINT as CHAR_POINT_CONST, MISS_PENALTY_POINT as MISS_PENALTY_POINT_CONST } from "./lib/const";
import { getMapId } from "./provider";
import { getTypingStatus } from "./tabs/typing-status/status-cell";
import { getLineCount, getTimeOffset } from "./typing-card/playing/playing-scene";
import { getScene } from "./typing-card/typing-card";

// ─── detail 型定義 ─────────────────────────────────────────

interface TypeSuccessDetail {
  /** 入力したキー */
  successKey: string;
  /** チャンクが完了したか */
  isCompleted: boolean;
  /** チャンクの種別 */
  chunkType: string | undefined;
  /** ライン経過時間 (ms) */
  constantLineTime: number;
  /** この入力で加算された点数（`CHAR_POINT` 比で打鍵量の目安に使える） */
  updatePoint: number;
}

interface TypeMissDetail {
  /** ミスしたキー */
  failKey: string;
}

interface LineCompletedDetail {
  /** ライン経過時間 (ms) */
  constantLineTime: number;
}

interface TimerUpdateDetail {
  /** 動画の現在時刻 (s) */
  currentTime: number;
  /** 動画の現在時刻（定数・補間なし）(s) */
  constantTime: number;
  /** ライン経過時間 (ms) */
  constantLineTime: number;
  /** ライン残り時間 (ms) */
  constantRemainLineTime: number;
}

interface LineChangeDetail {
  /** 新しいラインのインデックス */
  nextCount: number;
}

interface GameEndDetail {
  /** ゲーム終了時のライン経過時間 (ms) */
  constantLineTime: number;
}

interface GameStartDetail {
  /** 開始シーン ("play" | "practice" | "replay") */
  scene: string;
}

type PlayDetail = Record<never, never>;
type PauseDetail = Record<never, never>;
type ReadyDetail = Record<never, never>;

interface RateChangeDetail {
  /** 変更後の再生速度 */
  speed: number;
}

interface StateChangeDetail {
  /** YT.PlayerState の値 (-1 | 0 | 1 | 2 | 3 | 5) */
  state: number;
}

interface SeekedDetail {
  /** シーク後の現在時刻（秒） */
  time: number;
}

interface TickDetail {
  /** 動画の現在時刻 (s) */
  currentTime: number;
  /** ライン経過時間 (ms) */
  constantLineTime: number;
  /** ライン残り時間 (ms) */
  constantRemainLineTime: number;
}

interface Timer1sUpdateDetail {
  /** 動画の現在時刻（定数・補間なし）(s) */
  constantTime: number;
}

// ─── イベントマップ & リスナー ─────────────────────────────────

type TypeEventMap = {
  "type:success": TypeSuccessDetail;
  "type:miss": TypeMissDetail;
  "type:lineCompleted": LineCompletedDetail;
  "replay:success": TypeSuccessDetail;
  "replay:miss": TypeMissDetail;
  "replay:lineCompleted": LineCompletedDetail;
  restart: null;
  "timer:tick": TickDetail;
  "timer:100msUpdate": TimerUpdateDetail;
  "timer:1sUpdate": Timer1sUpdateDetail;
  "timer:lineChange": LineChangeDetail;
  "timer:end": GameEndDetail;
  "yt:start": GameStartDetail;
  "yt:play": PlayDetail;
  "yt:pause": PauseDetail;
  "yt:ready": ReadyDetail;
  "yt:rateChange": RateChangeDetail;
  "yt:stateChange": StateChangeDetail;
  "yt:seeked": SeekedDetail;
};
type TypeEventType = keyof TypeEventMap;
type TypeEventCallback<T extends TypeEventType> = (detail: TypeEventMap[T]) => void;

const eventListeners = new Map<TypeEventType, Set<TypeEventCallback<TypeEventType>>>();

export const dispatchTypeEvent = <T extends TypeEventType>(type: T, detail: TypeEventMap[T]) => {
  eventListeners.get(type)?.forEach((cb) => {
    cb(detail);
  });
};

// ─── window オブジェクト定義 ─────────────────────────────────

// getter を使って循環依存による TDZ エラーを回避する
// (直接代入すると import が解決される前にアクセスされる場合がある)
const ytypingType = {
  get CHAR_POINT() {
    return CHAR_POINT_CONST;
  },
  get MISS_PENALTY_POINT() {
    return MISS_PENALTY_POINT_CONST;
  },
  get getStatus() {
    return getTypingStatus;
  },
  get getSubstatus() {
    return getTypingSubstatus;
  },
  get getLineSubstatus() {
    return getLineSubstatus;
  },
  get getTypingStats() {
    return getTypingStats;
  },
  get getTypingWord() {
    return getTypingWord;
  },
  get getInputMode() {
    return getPlayingInputMode;
  },
  get getLineResults() {
    return getAllLineResult;
  },
  get getSelectLineIndex() {
    return getSelectLineIndex;
  },
  get getReplayRankingResult() {
    return getReplayRankingResult;
  },
  get getScene() {
    return getScene;
  },
  get getBuiltMap() {
    return getBuiltMap;
  },
  get getTimeOffset() {
    return getTimeOffset;
  },
  get getLineCount() {
    return getLineCount;
  },
  get getYTPlayer() {
    return getYTPlayer;
  },
  get getYTPlayerState() {
    return getYTPlayerState;
  },
  get getYTVideoId() {
    return getYTVideoId;
  },
  get getYTCurrentTime() {
    return getYTCurrentTime;
  },
  get getMapInfo() {
    return () => {
      const mapId = getMapId();
      if (mapId === null) return undefined;
      const trpc = getTRPCOptions();
      return getQueryClient().getQueryData(trpc.map.getById.queryOptions({ mapId }).queryKey);
    };
  },
  get calcRawPP() {
    return calcRawPP;
  },
  get getUserTopPPs() {
    return async () => {
      const trpc = getTRPCOptions();
      return getQueryClient().ensureQueryData(trpc.result.pp.getUserTopPps.queryOptions());
    };
  },
  addEventListener<T extends TypeEventType>(type: T, callback: TypeEventCallback<T>) {
    const listeners = eventListeners.get(type) ?? new Set<TypeEventCallback<TypeEventType>>();
    listeners.add(callback as TypeEventCallback<TypeEventType>);
    eventListeners.set(type, listeners);
  },
  removeEventListener<T extends TypeEventType>(type: T, callback: TypeEventCallback<T>) {
    eventListeners.get(type)?.delete(callback as TypeEventCallback<TypeEventType>);
  },
};

declare global {
  interface Window {
    __ytyping_type: typeof ytypingType;
  }
}

// SSR 時は window が存在しないため、クライアント側でのみ登録する
if (typeof window !== "undefined") window.__ytyping_type = ytypingType;
