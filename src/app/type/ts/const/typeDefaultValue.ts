import { RouterOutPuts } from "@/server/api/trpc";
import { $Enums } from "@prisma/client";
import { GameStateRef, PlayMode, StatusRef, YTStateRef } from "../type";

export const DEFAULT_STATUS_REF: StatusRef = {
  status: {
    count: 0,
    romaType: 0,
    kanaType: 0,
    flickType: 0,
    englishType: 0,
    spaceType: 0,
    symbolType: 0,
    numType: 0,
    rkpm: 0,
    clearRate: 100,
    kanaToRomaConvertCount: 0,
    maxCombo: 0,
    missCombo: 0,
    totalTypeTime: 0,
    totalLatency: 0,
    completeCount: 0,
    failureCount: 0,
  },
  lineStatus: {
    lineType: 0,
    lineMiss: 0,
    lineClearTime: 0,
    latency: 0,
    typeResult: [],
    lineStartSpeed: 1,
    lineStartInputMode: "roma",
  },
};

export const DEFAULT_YT_STATE_REF: YTStateRef = {
  isPaused: false,
  movieDuration: 0,
};
export const DEFAULT_GAME_STATE_REF: GameStateRef = {
  isRetrySkip: false,
  retryCount: 1,
  playMode: "playing" as PlayMode,
  startPlaySpeed: 1, //練習モード→本番モード移行時の初期スピード設定 (1倍速以上)
  displayLineTimeCount: 0, //0.1秒ごとにlineKpm/残り時間の表示を更新するためのプロパティ
  replay: {
    replayKeyCount: 0,
    userName: "",
  },
  practice: {
    myResultId: null,
  },
};

export const DEFAULT_SPEED = {
  defaultSpeed: 1,
  playSpeed: 1,
};

export const DEFAULT_USER_OPTIONS: NonNullable<
  RouterOutPuts["userTypingOption"]["getUserTypingOptions"]
> = {
  time_offset: 0,
  type_sound: false,
  miss_sound: false,
  line_clear_sound: false,
  next_display: "LYRICS" as $Enums.next_display,
  time_offset_key: "CTRL_LEFT_RIGHT" as $Enums.time_offset_key,
  toggle_input_mode_key: "ALT_KANA" as $Enums.toggle_input_mode_key,
};

export const CHANGE_TIME_OFFSET_VALUE = 0.05;

export const TIME_OFFSET_SHORTCUTKEY_RANGE = 0.1;
