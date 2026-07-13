export const PP_MODES = ["total", "roma", "kana", "english", "flick"] as const;
export type PpMode = (typeof PP_MODES)[number];

export const INPUT_PP_MODES = ["roma", "kana", "english", "flick"] as const;
export type InputPpMode = (typeof INPUT_PP_MODES)[number];

export const PP_MODE_LABELS: Record<PpMode, string> = {
  total: "総合",
  roma: "ローマ字",
  kana: "かな入力",
  flick: "フリック",
  english: "英語",
};

const NEUTRAL_ENGLISH_TYPE_RATE = 0.1;

export const PP_MODE_DESCRIPTIONS: Partial<Record<PpMode, string>> = {
  roma: `ローマ字入力のみ、英語入力の比率が${NEUTRAL_ENGLISH_TYPE_RATE * 100}%以下のリザルトが集計対象です`,
  kana: `かな入力のみ、英語入力の比率が${NEUTRAL_ENGLISH_TYPE_RATE * 100}%以下のリザルトが集計対象です`,
  english: "英語入力のみのリザルトが集計対象です",
};

type PpModeTypeCounts = {
  romaType: number;
  kanaType: number;
  flickType: number;
  englishType: number;
  spaceType: number;
  symbolType: number;
  numType: number;
};

/**
 * flick最優先(モード切替不可のため) → roma/kanaは英語打鍵比率10%以下のみ → englishのみ譜面
 * いずれにも該当しなければ null(どの方式のランキングにも集計しない)
 */
export function classifyResultPpMode(counts: PpModeTypeCounts): InputPpMode | null {
  const { romaType, kanaType, flickType, englishType, spaceType, symbolType, numType } = counts;
  const total = romaType + kanaType + flickType + englishType + spaceType + symbolType + numType;
  if (total === 0) return null;

  if (flickType > 0) return "flick";

  const englishRate = englishType / total;

  if (romaType > 0 && kanaType === 0 && englishRate <= NEUTRAL_ENGLISH_TYPE_RATE) return "roma";
  if (kanaType > 0 && romaType === 0 && englishRate <= NEUTRAL_ENGLISH_TYPE_RATE) return "kana";
  if (englishType > 0 && romaType === 0 && kanaType === 0) return "english";

  return null;
}
