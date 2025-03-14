import { $Enums } from "@prisma/client";
import { PlayMode } from "../type";

export const DEFAULT_YT_STATE_REF = {
  isPaused: false,
  movieDuration: 0,
};
export const DEFAULT_GAME_STATE_REF = {
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
    myResultId: null as number | null,
  },
};

export const DEFAULT_SPEED = {
  defaultSpeed: 1,
  playSpeed: 1,
};

export const DEFAULT_USER_OPTIONS = {
  time_offset: 0,
  kana_word_scroll: 10,
  roma_word_scroll: 16,
  type_sound: false,
  miss_sound: false,
  line_clear_sound: false,
  next_display: "LYRICS" as $Enums.next_display,
  line_completed_display: "HIGH_LIGHT" as $Enums.line_completed_display,
  time_offset_key: "CTRL_LEFT_RIGHT" as $Enums.time_offset_key,
  toggle_input_mode_key: "ALT_KANA" as $Enums.toggle_input_mode_key,
};

export const CHANGE_TIME_OFFSET_VALUE = 0.05;

export const TIME_OFFSET_SHORTCUTKEY_RANGE = 0.1;
