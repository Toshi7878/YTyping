import type { BuiltMapLine } from "lyrics-typing-engine";

type DifficultyOptions = {
  threshold?: number; // diversityペナルティ閾値 default: 0.6
  penaltyExp?: number; // ペナルティの指数（大きいほど急激に下がる） default: 2
  peakN?: number; // ピーク行数 default: 2
  peakRatio?: number; // ピーク合成比率 default: 0.3
  maxKPM?: number; // これを超えるKPMの行は異常値として無視 default: 1700
  minNotes?: number; // 基準notes数（これを中心に対数スケール） default: 270
  logScale?: number; // notesスケーリングの緩やかさ default: 0.17
  maxScale?: number; // notesScalingの上限倍率 default: 1.1
};

const DEFAULT_OPTIONS: Required<DifficultyOptions> = {
  threshold: 0.6,
  penaltyExp: 2,
  peakN: 2,
  peakRatio: 0.3,
  maxKPM: 1700,
  minNotes: 270,
  logScale: 0.17,
  maxScale: 1.1,
};

/** シャノンエントロピーでkanaの文字多様性を0〜1で算出 */
function calcDiversity(kana: string): number {
  if (!kana || kana.length <= 1) return 1;

  const freq: Record<string, number> = {};
  for (const c of kana) freq[c] = (freq[c] ?? 0) + 1;

  const n = kana.length;
  const H = Object.values(freq).reduce((s, count) => {
    const p = count / n;
    return s - p * Math.log2(p);
  }, 0);

  const maxH = Math.log2(n);
  return maxH === 0 ? 1 : H / maxH;
}

/**
 * diversityペナルティ係数
 * 閾値未満は (div / threshold) ^ exp で指数的に減衰
 * div ≈ 0（あ連打など）→ penalty ≈ 0
 * div >= threshold       → penalty = 1.0（影響なし）
 */
function calcPenalty(div: number, threshold: number, exp: number): number {
  if (div >= threshold) return 1.0;
  return (div / threshold) ** exp;
}

/**
 * totalNotesによるスケーリング係数（上下対称の対数スケール）
 * minNotes未満 → 対数で緩やかに下げる（0にならない）
 * minNotes以上 → 対数で緩やかに上げる（maxScaleで頭打ち）
 */
function calcNotesScaling(totalNotes: number, minNotes: number, logScale: number, maxScale: number): number {
  return Math.min(Math.max(1.0 + Math.log(totalNotes / minNotes) * logScale, 0), maxScale);
}

/** 譜面全体のstar ratingを算出 */
export function calcStarRating(lines: BuiltMapLine[], options?: DifficultyOptions): number {
  const { threshold, penaltyExp, peakN, peakRatio, maxKPM, minNotes, logScale, maxScale } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const active = lines.filter((l) => l.kpm.roma > 0 && l.notes.roma > 0 && l.kpm.roma <= maxKPM);
  if (active.length === 0) return 0;

  const totalNotes = active.reduce((s, l) => s + l.notes.roma, 0);

  const lineScores = active.map((line) => {
    const div = calcDiversity(line.kanaLyrics);
    const penalty = calcPenalty(div, threshold, penaltyExp);
    return {
      kpm: line.kpm.roma,
      notes: line.notes.roma,
      adjustedKPM: line.kpm.roma * penalty,
    };
  });

  // 加重平均KPM（romaのnotes数で重み付け）
  const avgKPM = lineScores.reduce((s, l) => {
    return s + l.adjustedKPM * (l.notes / totalNotes);
  }, 0);

  // ピークKPM（adjustedKPM上位N行の平均）
  const peakKPM =
    [...lineScores]
      .sort((a, b) => b.adjustedKPM - a.adjustedKPM)
      .slice(0, peakN)
      .reduce((s, l) => s + l.adjustedKPM, 0) / Math.min(peakN, lineScores.length);

  const difficultyScore = avgKPM * (1 - peakRatio) + peakKPM * peakRatio;

  // totalNotesによるスケーリング（対数・上下対称）
  const notesScaling = calcNotesScaling(totalNotes, minNotes, logScale, maxScale);

  return Math.round((difficultyScore / 100) * notesScaling * 100) / 100;
}
