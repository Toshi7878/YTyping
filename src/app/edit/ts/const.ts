import { UploadResult } from "@/types";

export const TAG_MAX_LEN = 10;
export const TAG_MIN_LEN = 2;

export const INITIAL_SERVER_ACTIONS_STATE: UploadResult = {
  id: null,
  title: "",
  message: "",
  status: 0,
};

export const LINE_ROW_SWITCH_CLASSNAMES = {
  currentTime: "current-time-line",
  selected: "selected-line",
};

export const CHOICE_TAGS = [
  "公式動画",
  "Cover/歌ってみた",
  "J-POP",
  "ボーカロイド/ボカロ",
  "東方ボーカル",
  "洋楽",
  "VTuber",
  "アニメ",
  "ゲーム",
  "英語",
  "英語&日本語",
  "多言語",
  "ラップ",
  "フリー音源",
  "ロック",
  "セリフ読み",
  "キッズ&ファミリー",
  "映画",
  "MAD",
  "Remix",
  "Nightcore",
  "TikTok",
  "音ゲー",
  "簡単",
  "難しい",
  "装飾譜面",
  "ギミック譜面",
  "YouTube Premium",
];

export const TAB_NAMES = ["情報&保存", "エディター", "ショートカットキー&設定"] as const;
export const NOT_EDIT_PERMISSION_TOAST_ID = "not-edit-permission-toast";
