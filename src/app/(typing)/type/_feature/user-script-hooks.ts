/**
 * YTyping ユーザースクリプト向けフック
 *
 * ## イベント命名規則
 * `ytyping:{domain}:{event}`
 * - `type`   : 入力イベント（通常プレイ・練習）
 * - `replay` : リプレイのシミュレート打鍵
 * - `restart`: プレイ再開（`restartPlay`）
 * - `timer`  : タイマーイベント
 * - `yt`     : YouTube プレイヤーイベント
 *
 * ## タイピングイベント（通常プレイ・練習）
 * @example
 * window.addEventListener("ytyping:type:success", (e) => {
 *   const { successKey, isCompleted, constantLineTime, updatePoint } = e.detail;
 * });
 * window.addEventListener("ytyping:type:miss",          (e) => console.log("miss!", e.detail.failKey));
 * window.addEventListener("ytyping:type:lineCompleted", (e) => console.log("line done!", e.detail.constantLineTime));
 *
 * ## リプレイ打鍵イベント（`simulateTypingInput` 経由。`detail` の形は通常の type 系と同じ）
 * @example
 * window.addEventListener("ytyping:replay:type:success", (e) => {
 *   const { successKey, isCompleted, constantLineTime, updatePoint } = e.detail;
 * });
 * window.addEventListener("ytyping:replay:type:miss", (e) => console.log("replay miss", e.detail.failKey));
 * window.addEventListener("ytyping:replay:type:lineCompleted", (e) => console.log("replay line", e.detail.constantLineTime));
 *
 * ## 再開イベント（`lib/play-restart` の `restartPlay` 完了後）
 * @example
 * window.addEventListener("ytyping:restart", (e) => {
 *   const { newPlayMode, previousScene } = e.detail;
 * });
 *
 * ## タイマーイベント
 * @example
 * window.addEventListener("ytyping:timer:update", (e) => {
 *   const { currentTime, constantLineTime, constantRemainLineTime } = e.detail;
 * });
 * window.addEventListener("ytyping:timer:lineChange", (e) => console.log("line →", e.detail.nextCount));
 * window.addEventListener("ytyping:timer:end",        (e) => console.log("end!", e.detail.constantLineTime));
 *
 * ## getter（任意タイミングで現在値を取得）
 * @example
 * const { kpm, score, miss } = window.__ytyping.getStatus();
 * const { maxCombo, clearRate } = window.__ytyping.getSubstatus();
 * const { typeCount, missCount } = window.__ytyping.getLineSubstatus();
 * const { CHAR_POINT, MISS_PENALTY_POINT } = window.__ytyping;
 * const mapMeta = window.__ytyping.getMapGetByIdCache(123); // React Query の map.getById キャッシュ（無ければ undefined）
 * const mapId = window.__ytyping.getMapId(); // Jotai の mapIdAtom（タイプページの譜面 ID、未設定なら null）
 * const currentMapMeta = window.__ytyping.getMapGetByIdCacheForCurrentMapId(); // getMapGetByIdCache(getMapId()) と同じ
 * const rawPp = window.__ytyping.calcRawPP({ accuracy: 0.99, clearRate: 1, minPlaySpeed: 1 }, 5.2);
 */

import { calcRawPP as calcRawPPFromServer, type RawPPInput } from "@/server/api/routers/result/pp";
import type { RouterOutputs } from "@/server/api/trpc";
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

// ─── CustomEvent 型定義 ─────────────────────────────────────

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

export function emitRestartPlayUserScript(): void {
  window.dispatchEvent(new CustomEvent("ytyping:restart", { detail: {} }));
}

function getMapInfo(): RouterOutputs["map"]["getById"] | undefined {
  const mapId = getMapId();
  if (mapId === null) return undefined;
  const trpc = getTRPCOptions();
  return getQueryClient().getQueryData(trpc.map.getById.queryOptions({ mapId }).queryKey);
}

/** サーバー `result/pp.ts` の `calcRawPP` と同一（星評価・正確率・打ち切り率・最低再生速度から 1 プレイ分の生 PP） */
export function calcRawPPOnClient(result: RawPPInput, starRating: number): number {
  return calcRawPPFromServer(result, starRating);
}

declare global {
  interface WindowEventMap {
    // ── 入力系 ────────────────────────────────────────────────
    /** キー入力成功時 */
    "ytyping:type:success": CustomEvent<TypeSuccessDetail>;
    /** キー入力ミス時 */
    "ytyping:type:miss": CustomEvent<TypeMissDetail>;
    /** ライン入力完了時 */
    "ytyping:type:lineCompleted": CustomEvent<LineCompletedDetail>;

    // ── リプレイ打鍵系（`replay.ts` の simulateTypingInput）────
    /** リプレイ: シミュレート成功時（`detail` は `ytyping:type:success` と同形） */
    "ytyping:replay:type:success": CustomEvent<TypeSuccessDetail>;
    /** リプレイ: シミュレートミス時 */
    "ytyping:replay:type:miss": CustomEvent<TypeMissDetail>;
    /** リプレイ: シミュレートでライン完了時 */
    "ytyping:replay:type:lineCompleted": CustomEvent<LineCompletedDetail>;

    // ── 再開系（`lib/play-restart.ts` の `restartPlay`）────────
    /** 再開処理完了後（状態は新シーン側に更新済み） */
    "ytyping:restart": CustomEvent<null>;

    // ── タイマー系 ───────────────────────────────────────────
    /** 毎フレーム（約60fps）発火 */
    "ytyping:timer:tick": CustomEvent<TickDetail>;
    /** 100ms ごとに発火 */
    "ytyping:timer:update": CustomEvent<TimerUpdateDetail>;
    /** 1000ms ごとに発火 */
    "ytyping:timer:1sUpdate": CustomEvent<Timer1sUpdateDetail>;
    /** ライン切り替わり時 */
    "ytyping:timer:lineChange": CustomEvent<LineChangeDetail>;
    /** ゲーム終了時 */
    "ytyping:timer:end": CustomEvent<GameEndDetail>;

    // ── YouTube 系 ───────────────────────────────────────────
    /** ゲーム初回開始時（seekTo(0) 後） */
    "ytyping:yt:start": CustomEvent<GameStartDetail>;
    /** YouTube 再生・再開時 */
    "ytyping:yt:play": CustomEvent<PlayDetail>;
    /** YouTube 一時停止時 */
    "ytyping:yt:pause": CustomEvent<PauseDetail>;
    /** YouTube Player 準備完了時 */
    "ytyping:yt:ready": CustomEvent<ReadyDetail>;
    /** 再生速度変更時 */
    "ytyping:yt:rateChange": CustomEvent<RateChangeDetail>;
    /** プレイヤー状態変化時 */
    "ytyping:yt:stateChange": CustomEvent<StateChangeDetail>;
    /** シーク完了時 */
    "ytyping:yt:seeked": CustomEvent<SeekedDetail>;
  }

  interface Window {
    __ytyping: {
      // ── 定数（読み取り専用・ゲッターのみ）──────────────────
      /** 1 文字正解あたりの加点（`lib/const` と同一） */
      readonly CHAR_POINT: number;
      /** 1 ミスあたりの減点（`CHAR_POINT / 2`） */
      readonly MISS_PENALTY_POINT: number;

      // ── ステータス系 ─────────────────────────────────────
      /** スコア・KPM・ミス数などのメインステータスを取得 */
      getStatus: typeof getTypingStatus;
      /** コンボ・クリア率・入力種別ごとの集計などを取得 */
      getSubstatus: typeof getTypingSubstatus;
      /** 現在ライン内の入力数・ミス数・入力履歴を取得 */
      getLineSubstatus: typeof getLineSubstatus;
      /** タイピング集計統計（チャンク完了数・ミス数など）を取得 */
      getTypingStats: typeof getTypingStats;
      /** 現在の typing word（入力済み文字・次チャンク・残りチャンク）を取得 */
      getTypingWord: typeof getTypingWord;
      /** 現在の入力モード（"roma" | "kana" 等）を取得 */
      getInputMode: typeof getPlayingInputMode;

      // ── ライン・結果系 ───────────────────────────────────
      /** 全ラインの結果を取得（ゲーム中・終了後ともに利用可） */
      getLineResults: typeof getAllLineResult;
      /** 結果画面で選択中のライン index を取得 */
      getSelectLineIndex: typeof getSelectLineIndex;
      /** リプレイ用のランキング結果を取得 */
      getReplayRankingResult: typeof getReplayRankingResult;

      // ── シーン・マップ系 ─────────────────────────────────
      /** 現在のシーン ("ready" | "play" | "practice" | "replay" | "play_end" 等）を取得 */
      getScene: typeof getScene;
      /** ビルド済みマップ（譜面データ）を取得 */
      getBuiltMap: typeof getBuiltMap;
      // ── タイマー・ライン位置系 ───────────────────────────
      /** 現在の時間オフセット（ms）を取得 */
      getTimeOffset: typeof getTimeOffset;
      /** 現在のライン番号を取得 */
      getLineCount: typeof getLineCount;

      // ── YouTube 系 ───────────────────────────────────────
      /** YouTube Player インスタンスを取得 */
      getYTPlayer: typeof getYTPlayer;
      /** YouTube Player の再生状態を取得 */
      getYTPlayerState: typeof getYTPlayerState;
      /** YouTube 動画 ID を取得 */
      getYTVideoId: typeof getYTVideoId;
      /** YouTube の現在再生時刻（秒）を取得 */
      getYTCurrentTime: typeof getYTCurrentTime;

      /** `getMapGetByIdCache(getMapId())` と同じ（現在ページの譜面メタの Query キャッシュ） */
      getMapInfo: typeof getMapInfo;

      /** 生 PP 算出（`@/server/api/routers/result/pp` の `calcRawPP` と同一式） */
      calcRawPP: typeof calcRawPPOnClient;
    };
  }
}

// ─── window への登録（モジュール初回ロード時に実行）──────────

// getter を使って循環依存による TDZ エラーを回避する
// (直接代入すると import が解決される前にアクセスされる場合がある)
window.__ytyping = {
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
    return getMapInfo;
  },
  get calcRawPP() {
    return calcRawPPOnClient;
  },
};

// ─── dispatch ヘルパー ────────────────────────────────────────

// 入力系
export const dispatchTypeSuccess = (detail: TypeSuccessDetail) => {
  window.dispatchEvent(new CustomEvent("ytyping:type:success", { detail }));
};

export const dispatchTypeMiss = (detail: TypeMissDetail) => {
  window.dispatchEvent(new CustomEvent("ytyping:type:miss", { detail }));
};

export const dispatchLineCompleted = (detail: LineCompletedDetail) => {
  window.dispatchEvent(new CustomEvent("ytyping:type:lineCompleted", { detail }));
};

// リプレイ打鍵系（関数名は WindowEventMap のキー文字列と区別するため emit 接頭辞）
export function emitReplayTypingSuccess(detail: TypeSuccessDetail): void {
  window.dispatchEvent(new CustomEvent("ytyping:replay:type:success", { detail }));
}

export function emitReplayTypingMiss(detail: TypeMissDetail): void {
  window.dispatchEvent(new CustomEvent("ytyping:replay:type:miss", { detail }));
}

export function emitReplayTypingLineCompleted(detail: LineCompletedDetail): void {
  window.dispatchEvent(new CustomEvent("ytyping:replay:type:lineCompleted", { detail }));
}

// タイマー系
export const dispatchTick = (detail: TickDetail) => {
  window.dispatchEvent(new CustomEvent("ytyping:timer:tick", { detail }));
};

export const dispatchTimerUpdate = (detail: TimerUpdateDetail) => {
  window.dispatchEvent(new CustomEvent("ytyping:timer:update", { detail }));
};

export const dispatchTimer1sUpdate = (detail: Timer1sUpdateDetail) => {
  window.dispatchEvent(new CustomEvent("ytyping:timer:1sUpdate", { detail }));
};

export const dispatchLineChange = (detail: LineChangeDetail) => {
  window.dispatchEvent(new CustomEvent("ytyping:timer:lineChange", { detail }));
};

export const dispatchGameEnd = (detail: GameEndDetail) => {
  window.dispatchEvent(new CustomEvent("ytyping:timer:end", { detail }));
};

// YouTube 系
export const dispatchYtStart = (detail: GameStartDetail) => {
  window.dispatchEvent(new CustomEvent("ytyping:yt:start", { detail }));
};

export const dispatchYtPlay = () => {
  window.dispatchEvent(new CustomEvent("ytyping:yt:play", { detail: {} }));
};

export const dispatchYtPause = () => {
  window.dispatchEvent(new CustomEvent("ytyping:yt:pause", { detail: {} }));
};

export const dispatchYtReady = () => {
  window.dispatchEvent(new CustomEvent("ytyping:yt:ready", { detail: {} }));
};

export const dispatchYtRateChange = (detail: RateChangeDetail) => {
  window.dispatchEvent(new CustomEvent("ytyping:yt:rateChange", { detail }));
};

export const dispatchYtStateChange = (detail: StateChangeDetail) => {
  window.dispatchEvent(new CustomEvent("ytyping:yt:stateChange", { detail }));
};

export const dispatchYtSeeked = (detail: SeekedDetail) => {
  window.dispatchEvent(new CustomEvent("ytyping:yt:seeked", { detail }));
};
